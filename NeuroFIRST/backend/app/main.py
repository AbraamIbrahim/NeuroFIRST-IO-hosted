import fastapi
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Literal
from enum import Enum
import ml, math_models as math_wrapper
import uvicorn

import uvicorn

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
    "https://neurofirst-io.onrender.com",
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
# onset_weights = {'Sudden': .5, 'Rapid': .25, 'Gradual': -.5, 'Fluctuating': 0}


class UrgencyModel(BaseModel):
    age:int
    sex: Literal['Male', 'Female', 'Other']
    symptom_duration_num:int
    symptom_duration_qualifier: Literal['hrs', 'days', 'wks', 'mos']
    # symptom_onset:str = Literal['Sudden', 'Rapid', 'Gradual', 'Fluctuating']
    symptom_onset: Literal['Sudden', 'Rapid', 'Gradual', 'Fluctuating']

    symptoms: list[str] #The str is the id
    notes:str # Realistically I probably do nothing with this. Maybe keyword search?

    


@app.post("/urgency_score")
def getUrgency(input:UrgencyModel):
    math_function_wrapper = math_wrapper.math_models(input)
    patient_symptoms = input.symptoms

    freq_counter = {Severity.CRITICAL: 0, Severity.MODERATE: 0, Severity.MINOR: 0} 
    for symptom in patient_symptoms: #TODO: Make these two lines more pythonic
        freq_counter[symptoms[symptom]["severity"]] +=1

    # 3 seems kinda severe to me man, idk
    if (freq_counter[Severity.CRITICAL] >= 3): return {"urgency": 10}
    if (freq_counter[Severity.CRITICAL] == 2): return {"urgency": 9}

    symptom_score = freq_counter[Severity.CRITICAL] * 7 + freq_counter[Severity.MODERATE]* 1 + freq_counter[Severity.MINOR] * .25 

    # symptom_score += (input.age - 50)/100.0
    symptom_score += math_function_wrapper.age_multiplier()

    symptom_score += ml.getModifier(int(symptom_score), input.symptom_onset)

    return {"urgency": min(10, round(symptom_score))}


if __name__ == "__main__":
    uvicorn.run(
        app=app,
        host="0.0.0.0",
        port=32425,  
    )


    