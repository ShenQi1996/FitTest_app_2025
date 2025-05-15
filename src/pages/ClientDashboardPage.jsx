import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getAuth, signOut } from "firebase/auth";
import {
  listenToClient,
  updateAppointments,
} from "../services/firestoreService";

const ClientDashboardPage = () => {
  const [clientData, setClientData] = useState(null);
  const [appointmentInput, setAppointmentInput] = useState({
    startTime: "",
  });
  const navigate = useNavigate();
  const { email, role } = useSelector((state) => state.user);

  const nowLocal = new Date().toISOString().slice(0, 16);

  // ——— Real-time listener for this client’s own data ———
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const unsubscribe = listenToClient(
      user.uid,
      (data) => setClientData(data),
      (err) => console.error("Error listening to client data:", err)
    );
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => navigate("/login"))
      .catch((err) => console.error("Logout error:", err));
  };

  const handleBook = async (e) => {
    e.preventDefault();
    const { startTime } = appointmentInput;

    if (!startTime) return;
    if (startTime < nowLocal) {
      alert("Appointment start time cannot be in the past.");
      return;
    }

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
      await updateAppointments(user.uid, [
        ...(clientData.appointments || []),
        { startTime, endTime: "", status: "pending" },
      ]);
      setAppointmentInput({ startTime: "" });
    } catch (err) {
      console.error("Error booking appointment:", err);
    }
  };

  const handleCancel = async (index) => {
    try {
      const updatedAppointments = clientData.appointments.filter(
        (_, i) => i !== index
      );
      const auth = getAuth();
      const user = auth.currentUser;
      await updateAppointments(user.uid, updatedAppointments);
      // onSnapshot will refresh clientData
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
          <p>
            Name: {clientData.firstname} {clientData.lastname}
          </p>
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
                  Cancel Appointment
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
          onChange={(e) =>
            setAppointmentInput({ startTime: e.target.value })
          }
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
