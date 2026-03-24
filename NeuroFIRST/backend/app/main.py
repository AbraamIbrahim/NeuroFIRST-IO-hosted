import fastapi
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Literal
from enum import Enum

app = fastapi.FastAPI()

class Severity(Enum):
    CRITICAL = 3
    MODERATE = 2
    MINOR = 1

#Allow CORS so that the frontend can call the backend
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# symptom_id: HIGH/MED/LOW
symptoms = {"s01": {"severity": Severity.CRITICAL},
    "s02": {"severity": Severity.CRITICAL},
    "s03": {"severity": Severity.CRITICAL},
    "s04": {"severity": Severity.CRITICAL},
    "s05": {"severity": Severity.CRITICAL},
    "s06": {"severity": Severity.CRITICAL},
    "s07": {"severity": Severity.CRITICAL},
    "s08": {"severity": Severity.CRITICAL},
    "s09": {"severity": Severity.CRITICAL},
    "s10": {"severity": Severity.MODERATE},
    "s11": {"severity": Severity.MODERATE},
    "s12": {"severity": Severity.MODERATE},
    "s13": {"severity": Severity.MODERATE},
    "s14": {"severity": Severity.MODERATE},
    "s15": {"severity": Severity.MODERATE},
    "s16": {"severity": Severity.MODERATE},
    "s17": {"severity": Severity.MINOR},
    "s18": {"severity": Severity.MINOR},
    "s19": {"severity": Severity.MINOR},
    "s20": {"severity": Severity.MINOR},
    "s21": {"severity": Severity.MINOR},
    "s22": {"severity": Severity.MINOR},
    "s23": {"severity": Severity.MINOR},
}
onset_weights = {'Sudden': .5, 'Rapid': .25, 'Gradual': -.5, 'Fluctuating': 0}


class UrgencyModel(BaseModel):
    age: int
    sex: Literal['Male', 'Female', 'Other']
    symptom_duration_num: int
    symptom_duration_qualifier: Literal['min', 'hrs', 'days', 'wks', 'mos']
    symptom_onset: Literal['Sudden', 'Rapid', 'Gradual', 'Fluctuating']
    symptoms: list[str]
    notes: str


@app.post("/urgency_score")
def getUrgency(input: UrgencyModel):
    patient_symptoms = input.symptoms

    freq_counter = {Severity.CRITICAL: 0, Severity.MODERATE: 0, Severity.MINOR: 0}
    for symptom in patient_symptoms:
        severity = symptoms[symptom]["severity"]
        freq_counter[severity] += 1

    if freq_counter[Severity.CRITICAL] >= 3:
        return {"urgency_score": 10}
    if freq_counter[Severity.CRITICAL] == 2:
        return {"urgency_score": 9}

    symptom_score = (
        freq_counter[Severity.CRITICAL] * 4
        + freq_counter[Severity.MODERATE] * 1
        + freq_counter[Severity.MINOR] * 0.25
    )

    symptom_score += (input.age - 50) / 100.0

    symptom_score += onset_weights[input.symptom_onset]

    return {"urgency_score": min(10, round(symptom_score))}



    