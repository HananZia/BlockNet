import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ isLoggedIn, logout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // clear JWT from localStorage / context
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark p-2 mb-4">
      <Link className="navbar-brand" to="/">BlockNet</Link>
      <div className="ml-auto">
        {isLoggedIn ? (
          <>
            <Link className="btn btn-outline-light mr-2" to="/dashboard">Dashboard</Link>
            <button className="btn btn-outline-danger" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link className="btn btn-outline-light mr-2" to="/login">Login</Link>
            <Link className="btn btn-outline-light" to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
