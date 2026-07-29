import React, { useState } from "react";
import axios from "axios";

function Login({ setLoggedIn }) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const login = async () => {

        try {

            const response = await axios.post(
                axios.post(
                    "https://student-performance-prediction-project-3.onrender.com/login",
                    {
                        email: email,
                        password: password
                    }
                );

            if (response.data.message === "Login Successful") {
                setLoggedIn(true);
            }
            else {
                alert("Invalid Email or Password");
            }

        } catch (error) {

            console.log(error);
            alert("Backend Error");

        }

    };

    return (
        <div className="container">

            <h1>Student Performance Prediction</h1>

            <h2>Login</h2>

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

            <button onClick={login}>
                Login
            </button>


        </div>
    );
}

export default Login;