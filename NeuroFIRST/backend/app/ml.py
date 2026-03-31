from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
from sklearn.pipeline import Pipeline
import numpy, pandas
from typing import Literal

discrete_onset: list[str] = ["Sudden", "Rapid", "Gradual", "Fluctuating"]

regression_data = pandas.read_excel("weights/training_data.xlsx")
X = regression_data[["onset", "severity"]].values
y = regression_data[["mod"]].values

print(regression_data.head())

pipeline = Pipeline([
    ("poly", PolynomialFeatures(2)),
    ("model", LinearRegression()),  # ← must be last
])
pipeline.fit(X, y)


def getModifier(severity: int, onset: str = Literal[*discrete_onset]):
    global discrete_onset
    wrapped_onset = 1 + discrete_onset.index(onset)
    raw = pipeline.predict([[wrapped_onset, severity]])[0][0]
    clamped = numpy.clip(raw, 0, 100)  # ← clamp after predict
    return (clamped - 50) / 25

if __name__ == "__main__":
    print(getModifier(3, "Sudden"))