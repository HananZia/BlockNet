import React, { useState } from "react";
import axios from "axios";

// USER LOGIN 

// Component to handle user login
export const Login = () => {
  const [email, setEmail] = useState("");      // Stores email input
  const [password, setPassword] = useState(""); // Stores password input
  const [error, setError] = useState("");       // Stores error messages

    const handleLogin = async (e) => {
    e.preventDefault(); // Prevent page reload on form submit
    setError("");       // Clear previous errors

    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password
      });

      const { access_token, user } = response.data;

      // Store JWT token in localStorage for future API requests
      localStorage.setItem("token", access_token);

      // Optional: store user info in localStorage
      localStorage.setItem("user", JSON.stringify(user));

      alert("Login successful!");
      // Redirect or update UI as needed
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

    return (
    <div>
      <h2>User Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleLogin}>
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
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;