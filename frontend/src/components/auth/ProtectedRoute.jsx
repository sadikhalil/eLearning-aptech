import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading, isLoggedIn } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fbf5dd",
        flexDirection: "column",
        gap: "16px"
      }}>
        <div style={{
          width: "44px", height: "44px",
          border: "3px solid #e2d9b8",
          borderTop: "3px solid #1b2d4f",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite"
        }} />
        <p style={{ color: "#718096", fontSize: "14px" }}>Loading your session...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Not logged in → go to login, preserve intended destination
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check — if allowedRoles specified and user role not in list
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
