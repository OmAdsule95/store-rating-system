import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");

  // Not logged in
  if (!token || !userString) {
    return <Navigate to="/" replace />;
  }

  let user;

  try {
    user = JSON.parse(userString);
  } catch (error) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return <Navigate to="/" replace />;
  }

  // Role not allowed
  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;