import React, { useState } from "react";
import axios from "axios";

// Backend base URL
const API_BASE_URL = "http://localhost:5000/api/auth";

//Registration
const Register = () => {                               
    // State variables to store form inputs
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // State for showing messages
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

        // handle registration    
        const handleRegister = async (e) => {
        e.preventDefault(); // prevent default form submission
        setMessage("");
        setError("");

        try {
            const response = await axios.post(`${API_BASE_URL}/register`, {
                username,
                email,
                password,
            });

            if (response.status === 201) {
                setMessage("User registered successfully!");
                setUsername("");
                setEmail("");
                setPassword("");
            }
        } catch (err) {
            if (err.response && err.response.data) {
                setError(err.response.data.error || "Registration failed");
            } else {
                setError("Registration failed. Try again.");
            }
        }
    };                                                   

        return (                                          //form JSX
        <div>
            <h2>Register</h2>
            <form onSubmit={handleRegister}>
                <div>
                    <label>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Register</button>
            </form>

            {message && <p style={{ color: "green" }}>{message}</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
};

export default Register;