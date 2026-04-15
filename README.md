# NeuroFIRST-IO Triage Tool

A clinical decision support system for neurological symptom triage at UVA Health's NeuroFIRST clinic.

## ⚠️ Important Disclaimer

**This application is for educational and research purposes only.** It is not intended for actual clinical use, diagnosis, or treatment decisions. All medical decisions should be made by qualified healthcare professionals. The algorithms and models used are simplified representations and may not reflect real clinical practices.

## Overview

NeuroFIRST-IO is a web-based triage assessment tool designed to assist clinicians in rapidly evaluating patient urgency for neurological symptoms. The system combines rule-based scoring with machine learning predictions to provide triage recommendations.

### What It Does

- **Symptom Assessment**: Clinicians input patient demographics and select relevant neurological symptoms
- **Urgency Scoring**: Calculates a priority score (1-10) based on symptom severity, frequency, patient age, and symptom onset patterns
- **Triage Recommendations**: Provides immediate feedback on patient priority levels
- **Performance Monitoring**: Includes benchmarking tools to ensure system responsiveness

### How It Works

The triage algorithm combines multiple factors:

1. **Symptom Severity**: Each symptom has a predefined severity level (Critical, Moderate, Minor)
2. **Symptom Frequency**: Counts symptoms by severity category with weighted scoring
3. **Age Multipliers**: Adjusts scores based on pediatric/elderly considerations using piecewise functions
4. **ML Onset Modifiers**: Uses polynomial regression to predict urgency modifiers based on symptom onset type and current severity score
5. **Final Scoring**: Combines all factors into a 1-10 urgency scale

## Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: CSS modules
- **State Management**: React hooks
- **API Communication**: Fetch API

### Backend
- **Framework**: FastAPI (Python)
- **ML Library**: scikit-learn with polynomial features
- **Data Validation**: Pydantic models
- **CORS**: Enabled for frontend communication
- **Server**: Uvicorn ASGI server

### Machine Learning
- **Model Type**: Polynomial regression pipeline
- **Features**: Symptom onset type (encoded) and severity score
- **Training Data**: Pre-trained on historical triage data
- **Output**: Modifier value (-2.5 to +2.5) added to base urgency score

## Tech Stack

- **Frontend**: React, TypeScript, Vite, CSS
- **Backend**: Python, FastAPI, Uvicorn
- **ML**: scikit-learn, pandas, numpy
- **Testing**: timeit, pytest-benchmark compatible
- **Deployment**: Designed for containerization (future)

## Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn
- Git

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd NeuroFIRST/backend/app
   ```

2. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Ensure training data is present:
   - The file `weights/training_data.xlsx` should contain the ML training data

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd NeuroFIRST/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Development Mode

1. **Start the Backend**:
   ```bash
   cd NeuroFIRST/backend/app
   python main.py
   ```
   The API will be available at `http://localhost:32425`

2. **Start the Frontend**:
   ```bash
   cd NeuroFIRST/frontend
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

### Production Mode

For production deployment, consider using:
- Docker containers
- Reverse proxy (nginx)
- Process manager (PM2 for Node.js, gunicorn for Python)

## Testing

### Runtime Benchmarks

The project includes performance benchmarking tools:

```bash
cd NeuroFIRST/backend/app
python testing/runtime_tests.py
```

This script:
- Tests `getUrgency` and `getModifier` functions
- Uses mock data of sizes n=10, 100, 1000
- Reports average, min, and max execution times
- Helps ensure system responsiveness under load

### Manual Testing

- Use the web interface to test different symptom combinations
- Verify API responses via tools like Postman or curl
- Check browser console for frontend errors

## API Documentation

### POST /urgency_score

Calculates patient urgency score.

**Request Body**:
```json
{
  "age": 45,
  "sex": "Female",
  "symptom_duration_num": 2,
  "symptom_duration_qualifier": "days",
  "symptom_onset": "Sudden",
  "symptoms": ["s01", "s02"],
  "notes": "Patient reports severe headache"
}
```

**Response**:
```json
{
  "urgency": 8
}
```

**Symptom Codes**:
- s01-s09: Critical symptoms
- s10-s16: Moderate symptoms
- s17-s23: Minor symptoms

## Project Structure

```
NeuroFIRST-IO/
├── NeuroFIRST/
│   ├── backend/
│   │   └── app/
│   │       ├── main.py              # FastAPI application
│   │       ├── ml.py                # ML prediction functions
│   │       ├── math_models.py       # Age-based calculations
│   │       ├── models.py            # Pydantic data models
│   │       ├── requirements.txt     # Python dependencies
│   │       ├── weights/
│   │       │   └── training_data.xlsx  # ML training data
│   │       └── testing/
│   │           └── runtime_tests.py # Performance benchmarks
│   └── frontend/
│       ├── src/
│       │   ├── App.tsx
│       │   ├── main.tsx
│       │   ├── api.ts
│       │   ├── results/
│       │   └── triage/
│       ├── public/
│       ├── package.json
│       └── vite.config.ts
├── README.md
└── package.json
```

## Development Guidelines

### Code Style
- **Python**: Follow PEP 8, use type hints
- **TypeScript**: Use ESLint configuration, strict type checking
- **Commits**: Use conventional commit format

### Adding New Symptoms
1. Update the `symptoms` dictionary in `main.py`
2. Assign appropriate severity levels
3. Test with the benchmarking script

### ML Model Updates
1. Update training data in `weights/training_data.xlsx`
2. Retrain the model in `ml.py`
3. Validate performance with runtime tests

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Submit a pull request

### Contributors
- London Grant (@London-Grant)
- Albert Yorn (@albrtyrn)
- Abraam Ibrahim (@abraamibrahim)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- UVA Health NeuroFIRST Clinic for clinical guidance
- Open source community for the tools and libraries used
