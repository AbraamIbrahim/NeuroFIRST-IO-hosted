import numpy
from models import UrgencyModel

class math_models():

    __slots__ = "patient_data" # b/c I love class efficiency

    
    
    def __init__(self, patient_data):
        self.patient_data: UrgencyModel = patient_data

    def age_multiplier(self, override: int = None):
        a = self.patient_data.age
        if (override): a = override

        P = 2.2 #Pediatric multiplier
        E = 10 # Elderly multiplier
        C = 1 #Base multiplier

        return numpy.piecewise(
            a,
            [a <=17, a <= 63, a <= 85, a > 85],
            [
                lambda a: P-(P-C)*(a/17),
                C,
                lambda a: C + (E-C)* ((a-63)/22),
                E
            ]
        )
    
# print(math_models(None).age_multiplier(63))