import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider }   from "./context/AuthContext";
import ProtectedRoute     from "./components/auth/ProtectedRoute";
import Navbar             from "./components/layout/Navbar";

// Pages
import Home           from "./pages/Home";
import Login          from "./pages/Login";
import Register       from "./pages/Register";
import AdminRegister  from "./pages/AdminRegister";
import Courses        from "./pages/Courses";
import CourseDetail   from "./pages/CourseDetail";
import Dashboard      from "./pages/Dashboard";
import Profile        from "./pages/Profile";
import AdminPanel     from "./pages/AdminPanel";
import InstructorPanel from "./pages/InstructorPanel";
import { useAuth }    from "./context/AuthContext";

const DashboardWrapper = () => {
  const { isAdmin, isInstructor } = useAuth();
  if (isAdmin) return <AdminPanel />;
  if (isInstructor) return <InstructorPanel />;
  return <Dashboard />;
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Navbar />
      <Routes>

        {/* ── Public routes ── */}
        <Route path="/"               element={<Home />}          />
        <Route path="/login"          element={<Login />}         />
        <Route path="/register"       element={<Register />}      />
        <Route path="/admin-register" element={<AdminRegister />} />
        <Route path="/courses"        element={<Courses />}       />
        <Route path="/courses/:id"    element={<CourseDetail />}  />

        {/* ── Protected — any logged in user ── */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard"  element={<DashboardWrapper />} />
          <Route path="/my-courses" element={<DashboardWrapper />} />
          <Route path="/profile"    element={<Profile />}   />
        </Route>

        {/* ── Protected — instructor/admin only ── */}
        <Route element={<ProtectedRoute allowedRoles={["instructor", "admin"]} />}>
          <Route path="/instructor" element={<InstructorPanel />} />
        </Route>

        {/* ── Protected — admin only ── */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminPanel />} />
        </Route>

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
