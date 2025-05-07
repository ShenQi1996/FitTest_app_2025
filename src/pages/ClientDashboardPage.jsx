import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import { getAuth, signOut } from "firebase/auth";

const ClientDashboardPage = () => {
    const navigate = useNavigate();
    const { email, role } = useSelector((state) => state.user);
    const handleLogout = () => {
      const auth = getAuth();
      signOut(auth)
        .then(() => {
          console.log("User signed out");
          navigate("/login");
        })
        .catch((error) => {
          console.error("Logout error:", error.message);
        });
    };
    
    return (
      <div>
        <h2>Welcome to your Dashboard</h2>
        <p>Email: {email}</p>
        <p>Role: {role}</p>
        <button onClick={handleLogout}>Log Out</button>
      </div>
    );
}

export default ClientDashboardPage