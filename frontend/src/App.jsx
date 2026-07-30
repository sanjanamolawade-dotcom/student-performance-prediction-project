import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import axios from "axios";
import "./App.css";

function App() {

  const [loggedIn, setLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const handleLogout = () => {
    setLoggedIn(false);
  };
  const [formData, setFormData] = useState({
    school: "GP",
    sex: "F",
    age: 17,
    address: "U",
    famsize: "GT3",
    Pstatus: "A",
    Medu: 3,
    Fedu: 3,
    Mjob: "teacher",
    Fjob: "services",
    reason: "course",
    guardian: "mother",
    traveltime: 1,
    studytime: 2,
    failures: 0,
    schoolsup: "no",
    famsup: "yes",
    paid: "no",
    activities: "yes",
    nursery: "yes",
    higher: "yes",
    internet: "yes",
    romantic: "no",
    famrel: 4,
    freetime: 3,
    goout: 3,
    Dalc: 1,
    Walc: 1,
    health: 5,
    absences: 2,
    G1: 12,
    G2: 14
  });


  const [result, setResult] = useState("");
  const [category, setCategory] = useState("");

  const [recommendation, setRecommendation] = useState([]);
  const [level, setLevel] = useState("");
  const [history, setHistory] = useState([]);
  const [chartData, setChartData] = useState([]);


  const options = {
    school: ["GP", "MS"],
    sex: ["F", "M"],
    address: ["U", "R"],
    famsize: ["GT3", "LE3"],
    Pstatus: ["A", "T"],
    Mjob: ["at_home", "health", "other", "services", "teacher"],
    Fjob: ["teacher", "other", "services", "health", "at_home"],
    reason: ["course", "other", "home", "reputation"],
    guardian: ["mother", "father", "other"],
    schoolsup: ["yes", "no"],
    famsup: ["no", "yes"],
    paid: ["no", "yes"],
    activities: ["no", "yes"],
    nursery: ["yes", "no"],
    higher: ["yes", "no"],
    internet: ["no", "yes"],
    romantic: ["no", "yes"]
  };


  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });

  };
  const fetchHistory = async () => {
    try {
      const response = await axios.get(
        "https://student-performance-prediction-project-3.onrender.com/history"
      );
      setHistory(response.data);
    } catch (error) {
      console.log(error);
    }
  };
  const fetchChartData = async () => {
    try {
      const response = await axios.get(
        "https://student-performance-prediction-project-3.onrender.com/history"
      );

      setChartData(response.data);

    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchHistory();
    fetchChartData();
  }, []);

  const predict = async () => {

    console.log("PREDICT FUNCTION START");

    const data = Object.values(formData).map(value =>
      isNaN(value) ? value : Number(value)
    );

    console.log("SENDING DATA:", data);

    try {
      console.log("Predict button clicked");
      console.log(data);

      const response = await axios.post(
        "https://student-performance-prediction-project-3.onrender.com/predict",
        {
          data: data
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      console.log("Response:", response.data);




      console.log("BACKEND RESPONSE:", response.data);


      setResult(response.data.predicted_score);
      setLevel(response.data.performance_level);
      setRecommendation(response.data.recommendation || []);


    } catch (error) {

      console.log("FULL ERROR:", error);

      if (error.response) {
        console.log("SERVER ERROR:", error.response.data);
        alert("Backend Error: " + JSON.stringify(error.response.data));
      }
      else {
        alert("Backend is not running");
      }

    }

  };

  if (!loggedIn) {

    if (showRegister) {
      return <Register />;
    }

    return (
      <>
        <Login setLoggedIn={setLoggedIn} />

        <button onClick={() => setShowRegister(true)}>
          Create New Account
        </button>

      </>
    );
  }
  return (

    <div className="container">
      <button onClick={handleLogout}>
        Logout
      </button>



      <div className="header">

        <h1>
          Student Performance Prediction
        </h1>

        <p>
          AI based system to predict student performance
          and provide personalized learning recommendations.
        </p>

      </div>
      {
        Object.keys(formData).map((field) => (

          <div className="field" key={field}>

            <label>{field}</label>


            {
              options[field] ? (

                <select
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                >

                  {
                    options[field].map((item) => (
                      <option key={item}>
                        {item}
                      </option>
                    ))
                  }

                </select>

              ) : (

                <input
                  type="number"
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                />

              )

            }

          </div>

        ))
      }

      <button
        type="button"
        onClick={() => {
          console.log("BUTTON CLICKED");
          predict();
        }}
      >
        Predict Score
      </button>
      {
        result && (

          <div className="result">

            <h2>
              Prediction Result
            </h2>

            <h3>
              Predicted Score : {result}
            </h3>

            <h3>
              Performance Level : {level}
            </h3>


            <h4>
              Personalized Learning Recommendation:
            </h4>


            <ul>
              {
                recommendation.map((item, index) => (
                  <li key={index}>
                    {item}
                  </li>
                ))
              }
            </ul>

          </div>

        )
      }
      {history.length > 0 && (
        <div className="history">
          <h2>Prediction History</h2>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Score</th>
                <th>Level</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {history.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.predicted_score}</td>
                  <td>{item.performance_level}</td>
                  <td>{item.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {chartData.length > 0 && (
        <div className="history">

          <h2>
            Performance Chart
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="level" />

              <YAxis />

              <Tooltip />

              <Bar dataKey="count" />

            </BarChart>
          </ResponsiveContainer>

        </div>
      )}


      <div className="about">

        <h2>
          About Model
        </h2>

        <p>
          Algorithm: Random Forest Regression
        </p>

        <p>
          Model Accuracy: 82.99%
        </p>

        <p>
          The system predicts student score based on
          academic and personal factors.
        </p>

      </div>

    </div>

  );

}

export default App;