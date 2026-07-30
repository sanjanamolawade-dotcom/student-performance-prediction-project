import React, { useState } from "react";
import axios from "axios";

function Register() {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const register = async () => {

        alert("Register button clicked");

        try {
            console.log("Before axios");

            const response = await axios.post(
                "https://student-performance-prediction-project-2.onrender.com/register",
                {
                    name: name,
                    email: email,
                    password: password
                }
            );
            console.log("After axios");
            console.log("Response:", response.data);
            alert(JSON.stringify(response.data));

        } catch (error) {

            console.log("FULL ERROR:", error);

            if (error.response) {
                console.log("Status:", error.response.status);
                console.log("Data:", error.response.data);
                alert(JSON.stringify(error.response.data));
            } else {
                console.log("Message:", error.message);
                alert(error.message);
            }

        }

    };


    return (
        <div className="container">

            <h1>
                Student Performance Prediction
            </h1>

            <h2>
                Register
            </h2>


            <input
                type="text"
                placeholder="Enter Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            <br /><br />


            <input
                type="email"
                placeholder="Enter Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <br /><br />


            <input
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <br /><br />


            <button onClick={register}>
                Register
            </button>


        </div>
    );
}

export default Register;