// src/pages/ClientDashboardPage.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getAuth, signOut } from "firebase/auth";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

const ClientDashboardPage = () => {
  const [clientData, setClientData] = useState(null);
  const [appointmentInput, setAppointmentInput] = useState({ startTime: "" });
  const navigate = useNavigate();
  const { email, role } = useSelector((state) => state.user);

  // compute current datetime-local min value
  const nowLocal = new Date().toISOString().slice(0, 16);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const docRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setClientData(docSnap.data());
        } else {
          console.error("Client data not found.");
        }
      },
      (error) => {
        console.error("Error listening to client data:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => navigate("/login"))
      .catch((error) => console.error("Logout error:", error.message));
  };

  const handleBook = async (e) => {
    e.preventDefault();
    const { startTime } = appointmentInput;

    // Validation: prevent past-date booking
    if (startTime < nowLocal) {
      alert("Cannot book an appointment in the past.");
      return;
    }

    // Prevent duplicates
    const alreadyExists = (clientData.appointments || []).some(
      (appt) => appt.startTime === startTime
    );
    if (alreadyExists) {
      alert("You already have an appointment at this time.");
      return;
    }

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const docRef = doc(db, "users", user.uid);

      await updateDoc(docRef, {
        appointments: [
          ...(clientData.appointments || []),
          { startTime, endTime: "", status: "pending" },
        ],
      });

      setAppointmentInput({ startTime: "" });
      // real-time listener will update the list
    } catch (err) {
      console.error("Error booking appointment:", err);
    }
  };

  const handleCancel = async (index) => {
    try {
      const updatedAppointments = clientData.appointments.filter((_, i) => i !== index);
      const auth = getAuth();
      const user = auth.currentUser;
      const docRef = doc(db, "users", user.uid);

      await updateDoc(docRef, { appointments: updatedAppointments });
      // real-time listener will update the list
    } catch (err) {
      console.error("Error cancelling appointment:", err);
    }
  };

  return (
    <div>
      <h2>Welcome to your Dashboard</h2>
      <p>Email: {email}</p>
      <p>Role: {role}</p>

      {clientData ? (
        <>
          <p>Name: {clientData.firstname} {clientData.lastname}</p>
          <p>Phone: {clientData.phone}</p>
          <p>Birthday: {clientData.birthday}</p>

          <h3>Your Appointments</h3>
          <ul>
            {(clientData.appointments || []).map((appt, i) => (
              <li key={i}>
                <p>Start: {appt.startTime}</p>
                <p>End: {appt.endTime || "N/A"}</p>
                <p>Status: {appt.status}</p>
                <button onClick={() => handleCancel(i)}>
                  Cancel This Appointment
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>Loading your information...</p>
      )}

      <h3>Book a New Appointment</h3>
      <form onSubmit={handleBook}>
        <input
          type="datetime-local"
          value={appointmentInput.startTime}
          onChange={(e) => setAppointmentInput({ startTime: e.target.value })}
          min={nowLocal}
          required
        />
        <button type="submit">Book Appointment</button>
      </form>

      <button onClick={handleLogout}>Log Out</button>
    </div>
  );
};

export default ClientDashboardPage;
