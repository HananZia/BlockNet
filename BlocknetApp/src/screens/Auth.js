import React, { useEffect, useState } from "react";
import axios from "axios";

// fetch current user info

const CurrentUser = () => {
    const [user, setUser] = useState(null); // Store user info
    const [error, setError] = useState(""); // Store any errors

        useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token"); // JWT stored in localStorage
            if (!token) {
                setError("No token found. Please login first.");
                return;
            }

            try {
                const response = await axios.get("http://localhost:5000/api/auth/me", {
                    headers: {
                        Authorization: `Bearer ${token}` // Pass JWT in Authorization header
                    }
                });
                setUser(response.data); // Set user info
            } catch (err) {
                setError(err.response?.data?.error || "Failed to fetch user info.");
            }
        };

        fetchUser();
    }, []);

        return (
        <div>
            <h2>Current User Info</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {user ? (
                <div>
                    <p><strong>Username:</strong> {user.username}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Role:</strong> {user.role}</p>
                </div>
            ) : (
                <p>Loading user info...</p>
            )}
        </div>
    );
};

export default CurrentUser;