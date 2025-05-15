// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useDispatch } from "react-redux";
import { setUser } from "../slices/userSlice";

const AuthContext = createContext({ loading: true });

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const ref  = doc(db, "users", firebaseUser.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          dispatch(setUser({
            email:     firebaseUser.email,
            role:      data.role,
            firstname: data.firstname,
            lastname:  data.lastname,
            birthday:  data.birthday,
            phone:     data.phone,
          }));
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [dispatch]);

  if (loading) {
    return <p>Loading authentication…</p>;
  }

  return (
    <AuthContext.Provider value={{ loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to access the auth-loading flag
export const useAuth = () => useContext(AuthContext);
