import pandas as pd
import pickle

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestRegressor


# Load dataset
df = pd.read_csv("../dataset/StudentsPerformance.csv")


# Store encoders
encoders = {}


# Encode categorical columns
for col in df.select_dtypes(include="object").columns:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])
    encoders[col] = le


# Features and Target
X = df.drop("G3", axis=1)
y = df["G3"]


# Print feature order
print("Features:")
print(X.columns.tolist())


# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)


# Train Model
model = RandomForestRegressor(
    n_estimators=100,
    random_state=42
)

model.fit(X_train, y_train)


# Accuracy
accuracy = model.score(X_test, y_test)

print("Model Accuracy:", accuracy)


# Save Model
with open("student_model.pkl", "wb") as f:
    pickle.dump(model, f)


# Save Encoders
with open("encoders.pkl", "wb") as f:
    pickle.dump(encoders, f)


print("Model and Encoders saved successfully!")