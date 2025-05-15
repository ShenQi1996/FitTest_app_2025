import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "../contexts/AuthContext";

const PrivateRoute = ({ children, requiredRole }) => {
  const { role } = useSelector((state) => state.user); // 👈 pull role from Redux
  const { loading } = useAuth();
  if (loading) return <p>Checking authentication...</p>;
  if (!role) return <Navigate to="/login" />;
  // 👇 Block access if role is defined and doesn't match
  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoute;
