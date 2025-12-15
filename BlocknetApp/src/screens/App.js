import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Pages
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import FileUpload from "./FileUpload";
import FileShare from "./FileShare";
import Blockchain from "./Blockchain";

// Components
import Navbar from "./Components/Navbar";

// Context or state
const App = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  // Fetch current user info if token exists
  useEffect(() => {
    if (token) {
      fetch("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setUser(data))
        .catch(() => {
          setUser(null);
          setToken(null);
          localStorage.removeItem("token");
        });
    }
  }, [token]);

    // Protect routes that require login
  const PrivateRoute = ({ children }) => {
    return token ? children : <Navigate to="/login" />;
  };

  //Logout function

    const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  //App return: Router, Navbar, Routes

    return (
    <Router>
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/register" element={<Register />} />

        {/* Private routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard user={user} />
            </PrivateRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <PrivateRoute>
              <FileUpload token={token} />
            </PrivateRoute>
          }
        />
        <Route
          path="/share"
          element={
            <PrivateRoute>
              <FileShare token={token} />
            </PrivateRoute>
          }
        />
        <Route
          path="/blockchain"
          element={
            <PrivateRoute>
              <Blockchain token={token} />
            </PrivateRoute>
          }
        />

        {/* Redirect unknown paths */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;