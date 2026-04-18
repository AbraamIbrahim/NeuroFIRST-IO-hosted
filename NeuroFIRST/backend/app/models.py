from pydantic import BaseModel
from typing import Literal
from enum import Enum

class Severity(Enum):
    CRITICAL = 3
    MODERATE = 2
    MINOR = 1

class UrgencyModel(BaseModel):
    age:int
    sex: Literal['Male', 'Female', 'Other']
    symptom_duration_num:int
    symptom_duration_qualifier: Literal['hrs', 'days', 'wks', 'mos']
    symptom_onset: Literal['Sudden', 'Rapid', 'Gradual', 'Fluctuating']
    symptoms: list[str]
    notes:str