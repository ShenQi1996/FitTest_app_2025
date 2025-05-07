import "./App.css";
import { useState } from "react";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { setUser } from "./slices/userSlice";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import TrainerDashboardPage from "./pages/TrainerDashboardPage";
import ClientDashboardPage from "./pages/ClientDashboardPage";
import PrivateRoute from "./components/PrivateRoute";
function App() {
  const dispatch = useDispatch();
  const [authLoaded, setAuthLoaded] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async user => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          dispatch(setUser({ email: user.email, role: userData.role }));
        }
      }
      setAuthLoaded(true);
    });

    return () => unsubscribe();
  }, [dispatch]);

  if (!authLoaded) {
    return <p>Loading...</p>;
  }
  return (
    <div className="App">
      <header className="App-header"> Welcome Peronsal trainer App</header>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route
          path="/trainer-dashboard"
          element={
            <PrivateRoute requiredRole="trainer">
              <TrainerDashboardPage />
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
