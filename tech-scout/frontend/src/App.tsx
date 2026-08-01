import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { Spinner } from "./components/Spinner";
import { LoginPage } from "./pages/LoginPage";
import { ParticipantDashboard } from "./pages/ParticipantDashboard";
import { MentorDashboard } from "./pages/MentorDashboard";

function Dashboard() {
  const { user } = useAuth();

  if (!user) return null;

  if (user.role === "MENTOR" || user.role === "ADMIN") {
    return <MentorDashboard />;
  }

  return <ParticipantDashboard />;
}

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-boot">
        <Spinner label="Loading Tech Scout..." />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/"
          element={user ? <Dashboard /> : <Navigate to="/login" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
