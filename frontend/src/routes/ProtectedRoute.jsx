import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  // Check if a JWT token exists
  const token = localStorage.getItem("token");

  // If there is no token, redirect to the login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If the user is authenticated, render the protected page
  return children;
};

export default ProtectedRoute;