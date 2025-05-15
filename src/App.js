import "./App.css";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import TesterDashboardPage from "./pages/TesterDashboardPage";
import ClientDashboardPage from "./pages/ClientDashboardPage";
import PrivateRoute from "./components/PrivateRoute";
function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route
          path="/tester-dashboard"
          element={
            <PrivateRoute requiredRole="tester">
              <TesterDashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="client-dashboard"
          element={
            <PrivateRoute requiredRole="client">
              <ClientDashboardPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
