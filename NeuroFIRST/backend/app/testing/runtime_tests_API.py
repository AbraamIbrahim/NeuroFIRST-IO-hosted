"""
Comprehensive Runtime Benchmarking Script for NeuroFIRST-IO Backend API

This script provides end-to-end performance testing for the NeuroFIRST-IO urgency scoring API.
Unlike the micro-benchmarking in runtime_tests.py, this focuses on real-world usage:
- Full HTTP request-response cycles via the /urgency_score endpoint
- Startup/loading time for the FastAPI application
- Realistic and worst-case input scenarios (all 23 symptoms, boundary ages, etc.)
- Concurrent request simulation to test scalability under load
- Memory and CPU profiling for bottleneck identification

The script uses httpx for async HTTP requests, allowing concurrent testing.
It generates diverse test cases and measures average, min, max, and percentile latencies.

Output: Detailed performance report with startup time, per-request metrics, and load test results.

Prerequisites: FastAPI server must be startable, httpx installed, virtual environment activated.

Usage: Run from the app directory with 'python testing/runtime_tests_API.py'
"""

import asyncio
import time
import statistics
import sys
import os
import subprocess
import signal
import psutil
import cProfile
import pstats
from io import StringIO
import json

# Add the parent directory to sys.path for relative imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

try:
    import httpx
    from main import app, UrgencyModel, symptoms
except ImportError as e:
    print(f"Import error: {e}. Ensure dependencies are installed and virtual environment is activated.")
    sys.exit(1)

# Server configuration
HOST = "127.0.0.1"
PORT = 8000  # Use a different port to avoid conflicts with production
BASE_URL = f"http://{HOST}:{PORT}"

def generate_realistic_test_cases():
    """
    Generate comprehensive test cases covering realistic and edge-case scenarios.

    Returns:
        list[dict]: List of test case dictionaries with input data and descriptions.
    """
    test_cases = []

    # Basic cases
    test_cases.append({
        "description": "Minimal input (1 minor symptom, young adult)",
        "data": {
            "age": 25,
            "sex": "Male",
            "symptom_duration_num": 2,
            "symptom_duration_qualifier": "hrs",
            "symptom_onset": "Gradual",
            "symptoms": ["s17"],  # 1 minor symptom
            "notes": "Test case"
        }
    })

    # Boundary ages
    for age in [1, 17, 18, 63, 64, 85, 100]:
        test_cases.append({
            "description": f"Boundary age {age} with moderate symptoms",
            "data": {
                "age": age,
                "sex": "Female",
                "symptom_duration_num": 1,
                "symptom_duration_qualifier": "days",
                "symptom_onset": "Sudden",
                "symptoms": ["s10", "s11", "s12"],  # 3 moderate
                "notes": f"Age boundary test: {age}"
            }
        })

    # All onset types
    for onset in ["Sudden", "Rapid", "Gradual", "Fluctuating"]:
        test_cases.append({
            "description": f"All onset types: {onset} with mixed symptoms",
            "data": {
                "age": 50,
                "sex": "Other",
                "symptom_duration_num": 3,
                "symptom_duration_qualifier": "wks",
                "symptom_onset": onset,
                "symptoms": ["s01", "s10", "s17"],  # 1 critical, 1 moderate, 1 minor
                "notes": f"Onset test: {onset}"
            }
        })

    # Hard rules
    test_cases.append({
        "description": "Hard rule: 3+ critical symptoms",
        "data": {
            "age": 40,
            "sex": "Male",
            "symptom_duration_num": 1,
            "symptom_duration_qualifier": "hrs",
            "symptom_onset": "Sudden",
            "symptoms": ["s01", "s02", "s03", "s04"],  # 4 critical
            "notes": "Should return urgency 10"
        }
    })

    test_cases.append({
        "description": "Hard rule: Exactly 2 critical symptoms",
        "data": {
            "age": 40,
            "sex": "Female",
            "symptom_duration_num": 1,
            "symptom_duration_qualifier": "hrs",
            "symptom_onset": "Rapid",
            "symptoms": ["s01", "s02"],  # 2 critical
            "notes": "Should return urgency 9"
        }
    })

    # Worst-case: All symptoms
    all_symptoms = list(symptoms.keys())
    test_cases.append({
        "description": "Worst-case: All 23 symptoms, elderly patient",
        "data": {
            "age": 90,
            "sex": "Female",
            "symptom_duration_num": 10,
            "symptom_duration_qualifier": "mos",
            "symptom_onset": "Fluctuating",
            "symptoms": all_symptoms,
            "notes": "Maximum complexity test"
        }
    })

    return test_cases

async def benchmark_single_request(client, test_case, num_runs=10):
    """
    Benchmark a single test case by making multiple HTTP requests.

    Args:
        client: httpx.AsyncClient instance
        test_case: dict with 'description' and 'data'
        num_runs: Number of times to run the test case

    Returns:
        dict: Benchmark results for this test case
    """
    times = []
    responses = []

    for _ in range(num_runs):
        start_time = time.time()
        try:
            response = await client.post("/urgency_score", json=test_case["data"])
            response.raise_for_status()
            responses.append(response.json())
        except Exception as e:
            print(f"Request failed: {e}")
            continue
        end_time = time.time()
        times.append(end_time - start_time)

    if not times:
        return {"description": test_case["description"], "error": "All requests failed"}

    avg_time = statistics.mean(times)
    min_time = min(times)
    max_time = max(times)
    p95_time = statistics.quantiles(times, n=20)[18]  # 95th percentile

    return {
        "description": test_case["description"],
        "num_requests": len(times),
        "avg_time": avg_time,
        "min_time": min_time,
        "max_time": max_time,
        "p95_time": p95_time,
        "sample_response": responses[0] if responses else None
    }

async def benchmark_concurrent_requests(client, test_case, concurrency=10, num_requests=50):
    """
    Benchmark concurrent requests for a test case.

    Args:
        client: httpx.AsyncClient instance
        test_case: dict with test data
        concurrency: Number of concurrent requests
        num_requests: Total number of requests to make

    Returns:
        dict: Concurrent benchmark results
    """
    async def make_request():
        start_time = time.time()
        try:
            response = await client.post("/urgency_score", json=test_case["data"])
            response.raise_for_status()
            return time.time() - start_time, response.json()
        except Exception as e:
            return None, str(e)

    semaphore = asyncio.Semaphore(concurrency)
    async def limited_request():
        async with semaphore:
            return await make_request()

    tasks = [limited_request() for _ in range(num_requests)]
    results = await asyncio.gather(*tasks)

    times = [t for t, _ in results if t is not None]
    errors = [e for _, e in results if isinstance(e, str)]

    if not times:
        return {"description": f"Concurrent {test_case['description']}", "error": "All requests failed"}

    avg_time = statistics.mean(times)
    min_time = min(times)
    max_time = max(times)
    p95_time = statistics.quantiles(times, n=20)[18]

    return {
        "description": f"Concurrent {test_case['description']}",
        "concurrency": concurrency,
        "total_requests": num_requests,
        "successful_requests": len(times),
        "failed_requests": len(errors),
        "avg_time": avg_time,
        "min_time": min_time,
        "max_time": max_time,
        "p95_time": p95_time
    }

def measure_startup_time():
    """
    Measure the time to start the FastAPI application and load dependencies.

    Returns:
        float: Startup time in seconds
    """
    start_time = time.time()

    # Import main module to trigger loading
    import importlib
    importlib.reload(sys.modules['main'])

    end_time = time.time()
    return end_time - start_time

def profile_memory_usage(func, *args, **kwargs):
    """
    Profile memory usage of a function call.

    Args:
        func: Function to profile
        *args, **kwargs: Arguments for the function

    Returns:
        dict: Memory usage statistics
    """
    process = psutil.Process()
    initial_memory = process.memory_info().rss / 1024 / 1024  # MB

    result = func(*args, **kwargs)

    final_memory = process.memory_info().rss / 1024 / 1024  # MB
    memory_used = final_memory - initial_memory

    return {
        "initial_memory_mb": initial_memory,
        "final_memory_mb": final_memory,
        "memory_used_mb": memory_used,
        "result": result
    }

def profile_cpu_usage(func, *args, **kwargs):
    """
    Profile CPU usage of a function call using cProfile.

    Args:
        func: Function to profile
        *args, **kwargs: Arguments for the function

    Returns:
        str: Profiling report
    """
    pr = cProfile.Profile()
    pr.enable()
    result = func(*args, **kwargs)
    pr.disable()

    s = StringIO()
    ps = pstats.Stats(pr, stream=s).sort_stats('cumulative')
    ps.print_stats(10)  # Top 10 functions
    return s.getvalue()

async def run_benchmarks():
    """
    Main function to run all benchmarks.
    """
    print("NeuroFIRST-IO Comprehensive API Runtime Benchmarking")
    print("=" * 60)

    # Measure startup time
    print("\n1. Measuring Startup Time...")
    startup_time = measure_startup_time()
    print(".4f")

    # Start the FastAPI server in a subprocess
    print("\n2. Starting FastAPI Server...")
    server_process = subprocess.Popen([
        sys.executable, "-m", "uvicorn", "main:app",
        "--host", HOST, "--port", str(PORT), "--log-level", "error"
    ], cwd=os.path.dirname(os.path.dirname(__file__)))  # Set cwd to parent directory (app/)

    # Wait for server to start
    await asyncio.sleep(3)  # Give server time to start

    try:
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
            # Test server connectivity
            try:
                response = await client.get("/docs")
                if response.status_code != 200:
                    print(f"Server not responding. Status: {response.status_code}")
                    return
            except Exception as e:
                print(f"Cannot connect to server: {e}")
                return

            print("Server started successfully.")

            # Generate test cases
            test_cases = generate_realistic_test_cases()
            print(f"\n3. Running Benchmarks with {len(test_cases)} test cases...")

            # Single request benchmarks
            single_results = []
            for test_case in test_cases:
                print(f"  Benchmarking: {test_case['description']}")
                result = await benchmark_single_request(client, test_case)
                single_results.append(result)

            # Concurrent benchmarks (using the worst-case scenario)
            worst_case = test_cases[-1]  # All symptoms case
            print(f"\n4. Running Concurrent Load Test: {worst_case['description']}")
            concurrent_result = await benchmark_concurrent_requests(client, worst_case)

            # Memory and CPU profiling (on a single request)
            print("\n5. Profiling Memory and CPU Usage...")
            test_data = worst_case["data"]

            # Memory profiling
            def sync_request():
                with httpx.Client(base_url=BASE_URL, timeout=10.0) as client:
                    response = client.post("/urgency_score", json=test_data)
                    response.raise_for_status()
                    return response.json()

            memory_profile = profile_memory_usage(sync_request)
            cpu_profile = profile_cpu_usage(sync_request)

        # Print results
        print("\n" + "=" * 60)
        print("RESULTS SUMMARY")
        print("=" * 60)

        print("\nSTARTUP TIME:")
        print(f"{startup_time:.4f} seconds")

        print("\nSINGLE REQUEST BENCHMARKS:")
        print("Description\t\t\tAvg Time (s)\tMin (s)\tMax (s)\tP95 (s)")
        print("-" * 80)
        for result in single_results:
            if "error" in result:
                print(f"{result['description']}\t\t\tERROR: {result['error']}")
            else:
                desc = result['description'][:25] + "..." if len(result['description']) > 25 else result['description']
                print(f"{desc}\t\t\t{result['avg_time']:.4f}\t\t{result['min_time']:.4f}\t\t{result['max_time']:.4f}\t\t{result['p95_time']:.4f}")

        print("\nCONCURRENT LOAD TEST:")
        if "error" in concurrent_result:
            print(f"ERROR: {concurrent_result['error']}")
        else:
            print(f"Concurrency: {concurrent_result['concurrency']}")
            print(f"Total Requests: {concurrent_result['total_requests']}")
            print(f"Successful: {concurrent_result['successful_requests']}")
            print(f"Failed: {concurrent_result['failed_requests']}")
            print(f"Average Time: {concurrent_result['avg_time']:.4f} s")
            print(f"Min Time: {concurrent_result['min_time']:.4f} s")
            print(f"Max Time: {concurrent_result['max_time']:.4f} s")
            print(f"95th Percentile: {concurrent_result['p95_time']:.4f} s")

        print("\nMEMORY USAGE (worst-case request):")
        print(f"Initial Memory: {memory_profile['initial_memory_mb']:.2f} MB")
        print(f"Final Memory: {memory_profile['final_memory_mb']:.2f} MB")
        print(f"Memory Used: {memory_profile['memory_used_mb']:.2f} MB")

        print("\nCPU PROFILE (top 10 functions):")
        print(cpu_profile)

    finally:
        # Clean up server process
        print("\n6. Shutting down server...")
        server_process.terminate()
        try:
            server_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            server_process.kill()
        print("Server shut down.")

if __name__ == "__main__":
    asyncio.run(run_benchmarks())