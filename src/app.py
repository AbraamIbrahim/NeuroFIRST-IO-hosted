import fastapi
from pydantic import BaseModel
from typing import Literal

app = fastapi.FastAPI()




class UrgencyModel(BaseModel):
    age:int
    sex:str = Literal['Male', 'Female', 'Other']
    symptom_duration_num:int
    symptom_duration_qualifier: Literal['min', 'hrs', 'days', 'wks', 'mos']
    symptom_onset:str

    symptoms: list[str]
    notes:str


@app.get("/urgency_score")
def getUrgency(input:UrgencyModel):
    return {"lol": "lmao"}