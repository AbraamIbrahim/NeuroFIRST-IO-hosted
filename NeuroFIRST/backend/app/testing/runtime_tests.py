"""
Runtime Benchmarking Script for NeuroFIRST-IO Backend Algorithms

This script benchmarks the performance of key algorithms in the NeuroFIRST-IO backend:
- getUrgency: Calculates patient urgency scores based on symptoms, demographics, and ML predictions.
- getModifier: Predicts onset-based modifiers using a trained polynomial regression model.

The script generates mock datasets of varying sizes (n=10, 100, 1000) to test scalability.
It uses Python's timeit module for high-precision timing measurements, running multiple
repeats to account for variability and provide average, min, and max execution times.

Output: A tabular summary of runtime statistics for each function and dataset size.

Usage: Run from the app directory with 'python testing/runtime_tests.py'
"""

import timeit
import random
import sys
import os

# Add the parent directory to sys.path to allow relative imports from the testing subdirectory
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

# Import the functions to benchmark
from main import getUrgency, symptoms  # getUrgency is the main urgency calculation endpoint
from models import UrgencyModel  # Pydantic model for patient data validation
from ml import getModifier  # ML-based modifier prediction function

def generate_mock_urgency_data(n):
    """
    Generate n mock UrgencyModel instances for benchmarking getUrgency.

    This function creates synthetic patient data with random but realistic values:
    - Age: 1-100 years
    - Sex: Male, Female, or Other
    - Symptom duration: 1-10 units (hrs, days, wks, mos)
    - Onset: Sudden, Rapid, Gradual, or Fluctuating
    - Symptoms: 1-5 random symptom IDs from the predefined symptoms dictionary
    - Notes: Placeholder string

    Args:
        n (int): Number of mock data points to generate.

    Returns:
        list[UrgencyModel]: List of n UrgencyModel instances.
    """
    data = []
    for _ in range(n):
        age = random.randint(1, 100)
        sex = random.choice(['Male', 'Female', 'Other'])
        symptom_duration_num = random.randint(1, 10)
        symptom_duration_qualifier = random.choice(['hrs', 'days', 'wks', 'mos'])
        symptom_onset = random.choice(['Sudden', 'Rapid', 'Gradual', 'Fluctuating'])
        num_symptoms = random.randint(1, 5)
        patient_symptoms = random.sample(list(symptoms.keys()), num_symptoms)
        notes = "Mock notes"
        data.append(UrgencyModel(
            age=age,
            sex=sex,
            symptom_duration_num=symptom_duration_num,
            symptom_duration_qualifier=symptom_duration_qualifier,
            symptom_onset=symptom_onset,
            symptoms=patient_symptoms,
            notes=notes
        ))
    return data

def generate_mock_modifier_data(n):
    """
    Generate n tuples of (severity, onset) for benchmarking getModifier.

    This creates input data for the ML modifier function:
    - Severity: Integer from 1-10 (representing symptom severity score)
    - Onset: One of the four onset types (Sudden, Rapid, Gradual, Fluctuating)

    Args:
        n (int): Number of mock data points to generate.

    Returns:
        list[tuple[int, str]]: List of n (severity, onset) tuples.
    """
    data = []
    for _ in range(n):
        severity = random.randint(1, 10)
        onset = random.choice(['Sudden', 'Rapid', 'Gradual', 'Fluctuating'])
        data.append((severity, onset))
    return data

def benchmark_function(func, data, repeats=5, number=10):
    """
    Benchmark a function's execution time on given data using timeit.

    This function uses Python's timeit module for accurate timing measurements.
    It runs the function multiple times on the entire dataset to simulate real-world usage.
    The lambda functions ensure that the data processing (list comprehensions) is included
    in the timing, providing end-to-end performance metrics.

    Args:
        func (callable): The function to benchmark (getUrgency or getModifier).
        data (list): The input data for the function.
        repeats (int): Number of timing repeats for statistical reliability (default: 5).
        number (int): Number of executions per repeat (default: 10).

    Returns:
        tuple[float, float, float]: (average_time_per_call, min_time_per_call, max_time_per_call)
                                     Times are in seconds, averaged over all calls in the dataset.
    """
    times = []
    for _ in range(repeats):
        if len(data) == 0:
            continue
        # Time the function calls
        if func == getUrgency:
            # getUrgency takes a single UrgencyModel instance
            # We time processing the entire list to measure bulk performance
            time_taken = timeit.timeit(
                lambda: [func(item) for item in data],
                number=number
            )
        elif func == getModifier:
            # getModifier takes (severity, onset) tuple
            time_taken = timeit.timeit(
                lambda: [func(sev, ons) for sev, ons in data],
                number=number
            )
        # Calculate average time per individual function call
        times.append(time_taken / number / len(data))
    if times:
        avg_time = sum(times) / len(times)
        min_time = min(times)
        max_time = max(times)
    else:
        avg_time = min_time = max_time = 0
    return avg_time, min_time, max_time

def main():
    """
    Main execution function for the benchmarking script.

    This function orchestrates the entire benchmarking process:
    1. Defines the dataset sizes to test scalability (10, 100, 1000).
    2. Lists the functions to benchmark with their corresponding data generators.
    3. For each function and size, generates mock data and runs benchmarks.
    4. Collects results and prints a formatted table.

    The results show how performance scales with input size, helping identify
    potential bottlenecks in the urgency scoring and ML prediction algorithms.
    """
    # Test dataset sizes to evaluate scalability
    sizes = [10, 100, 1000]

    # Define functions to benchmark: (name, function, data_generator)
    functions = [
        ("getUrgency", getUrgency, generate_mock_urgency_data),
        ("getModifier", getModifier, generate_mock_modifier_data)
    ]

    results = []  # Will store [func_name, n, avg_time, min_time, max_time]

    # Run benchmarks for each function and dataset size
    for func_name, func, data_gen in functions:
        for n in sizes:
            # Generate mock data for this test case
            data = data_gen(n)
            # Benchmark the function on this data
            avg, min_t, max_t = benchmark_function(func, data)
            # Store results as strings for easy formatting
            results.append([func_name, n, f"{avg:.6f}", f"{min_t:.6f}", f"{max_t:.6f}"])

    # Print the results table
    print("Function\tn\tAverage Time (s)\tMin Time (s)\tMax Time (s)")
    print("-" * 70)
    for row in results:
        print("{}\t{}\t{}\t\t{}\t\t{}".format(row[0], row[1], row[2], row[3], row[4]))

if __name__ == "__main__":
    # Standard Python idiom to run main() when script is executed directly
    main()