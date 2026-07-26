from fastapi import FastAPI
import joblib
import numpy as np
import sqlite3
from datetime import datetime
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

# SQLite Database Connection
conn = sqlite3.connect("database.db", check_same_thread=False)
cursor = conn.cursor()


# Create Users Table
cursor.execute("""
CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT
)
""")

conn.commit()

cursor.execute("""
CREATE TABLE IF NOT EXISTS prediction_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    predicted_score REAL,
    performance_level TEXT,
    recommendation TEXT,
    created_at TEXT
)
""")

conn.commit()


# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)   

# Input format
class StudentData(BaseModel):
    data: list
class LoginData(BaseModel):
    email: str
    password: str
class RegisterData(BaseModel):
    name: str
    email: str
    password: str

# Load ML model and encoders
model = joblib.load("student_model.pkl")
encoders = joblib.load("encoders.pkl")


# Same order as training features
feature_order = [
    'school',
    'sex',
    'age',
    'address',
    'famsize',
    'Pstatus',
    'Medu',
    'Fedu',
    'Mjob',
    'Fjob',
    'reason',
    'guardian',
    'traveltime',
    'studytime',
    'failures',
    'schoolsup',
    'famsup',
    'paid',
    'activities',
    'nursery',
    'higher',
    'internet',
    'romantic',
    'famrel',
    'freetime',
    'goout',
    'Dalc',
    'Walc',
    'health',
    'absences',
    'G1',
    'G2'
]



@app.get("/")
def home():
    return {
        "message": "Student Performance Prediction API is Running Successfully!"
    }

@app.post("/predict")
def predict(student: StudentData):
    print(student)
    print("Received Data:", student.data)

    data = student.data.copy()

    # Encode categorical values
    for i, col in enumerate(feature_order):

        if col in encoders:
            if isinstance(data[i], str):
                data[i] = encoders[col].transform([data[i]])[0]

    print("Number of features:", len(data))
    print("Feature order:", feature_order)
    print("Data:", data)

    data = data[:32]


    input_data = np.array(data).reshape(1, -1)


    prediction = model.predict(input_data)


    score = round(float(prediction[0]), 2)


    # Performance Level
    if score >= 16:
        performance_level = "Excellent"

    elif score >= 12:
        performance_level = "Good"

    elif score >= 8:
        performance_level = "Average"

    else:
        performance_level = "Needs Improvement"


    # Recommendation
    if score < 10:
        recommendation = [
            "Increase your daily study time",
            "Practice more questions",
            "Focus on basic concepts"
        ]

    elif score < 15:
        recommendation = [
            "Maintain a regular study schedule",
            "Revise important topics regularly",
            "Practice previous year questions"
        ]

    else:
        recommendation = [
            "Keep your current learning strategy",
            "Try advanced problems",
            "Help others to strengthen your concepts"
        ]
    

    # Save Prediction to SQLite
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO prediction_history
        (predicted_score, performance_level, recommendation, created_at)
        VALUES (?, ?, ?, ?)
        """,
        (
            score,
            performance_level,
            ", ".join(recommendation),
            datetime.now().strftime("%d-%m-%Y %H:%M:%S")
        )
    )

    conn.commit()

    return {
        "predicted_score": score,
        "performance_level": performance_level,
        "recommendation": recommendation
    }
@app.post("/login")
def login(user: LoginData):

    print("LOGIN DATA:", user.email, user.password)

    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM users WHERE email=? AND password=?",
        (user.email, user.password)
    )

    result = cursor.fetchone()

    print("DATABASE RESULT:", result)

    if result:
        return {
            "message": "Login Successful"
        }

    return {
        "message": "Invalid Email or Password"
    }
@app.post("/register")
def register(user: RegisterData):

    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO users(name, email, password)
            VALUES (?, ?, ?)
            """,
            (user.name, user.email, user.password)
        )

        conn.commit()

        return {
            "message": "Registration Successful"
        }

    except sqlite3.IntegrityError:

        return {
            "message": "Email already exists"
        }
@app.get("/history")
def get_history():
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, predicted_score, performance_level,
               recommendation, created_at
        FROM prediction_history
        ORDER BY id DESC
    """)

    rows = cursor.fetchall()

    history = []

    for row in rows:
        history.append({
            "id": row[0],
            "predicted_score": row[1],
            "performance_level": row[2],
            "recommendation": row[3],
            "created_at": row[4]
        })

    return history

@app.get("/chart-data")
def chart_data():
    cursor = conn.cursor()

    cursor.execute("""
    SELECT performance_level, COUNT(*)
    FROM prediction_history
    GROUP BY performance_level
    """)

    rows = cursor.fetchall()

    data = []

    for row in rows:
        data.append({
            "level": row[0],
            "count": row[1]
        })

    return data
   