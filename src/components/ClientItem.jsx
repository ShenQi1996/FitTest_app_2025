import React, { useState } from "react";
import ClientForm from "./ClientForm";
import { updateAppointments } from "../services/firestoreService";

const ClientItem = ({
  client,
  isExpanded,
  isEditing,
  toggleExpand,
  setEditClientId,
  handleDelete,
  editData,
  setEditData,
  handleEditSubmit,
  updateClientInList,
}) => {
  const [appointmentEdits, setAppointmentEdits] = useState({});
  const [newAppointmentStart, setNewAppointmentStart] = useState("");

  const handleAppointmentChange = (index, field, value) => {
    setAppointmentEdits((prev) => ({
      ...prev,
      [index]: { ...prev[index], [field]: value },
    }));
  };

  const handleAppointmentUpdate = async (index) => {
    const updatedAppointments = [...(client.appointments || [])];
    const edits = appointmentEdits[index];
    if (!edits) return;

    updatedAppointments[index] = {
      ...updatedAppointments[index],
      ...edits,
    };

    try {
      await updateAppointments(client.id, updatedAppointments);
      updateClientInList({ ...client, appointments: updatedAppointments });
      alert("Appointment updated.");
    } catch (err) {
      console.error("Error updating appointment:", err);
    }
  };

  const handleAppointmentDelete = async (index) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );
    if (!confirmed) return;

    const updatedAppointments = client.appointments.filter((_, i) => i !== index);

    try {
      await updateAppointments(client.id, updatedAppointments);
      updateClientInList({ ...client, appointments: updatedAppointments });
      alert("Appointment cancelled.");
    } catch (err) {
      console.error("Error cancelling appointment:", err);
    }
  };

  const handleAddAppointment = async (e) => {
    e.preventDefault();
    const newAppt = {
      startTime: newAppointmentStart,
      endTime: "",
      status: "pending",
    };
    const updatedAppointments = [
      ...(client.appointments || []),
      newAppt,
    ];

    try {
      await updateAppointments(client.id, updatedAppointments);
      updateClientInList({ ...client, appointments: updatedAppointments });
      setNewAppointmentStart("");
      alert("Appointment created.");
    } catch (err) {
      console.error("Error adding appointment:", err);
    }
  };

  return (
    <li onClick={() => toggleExpand(client.id)}>
      <strong>
        {client.firstname} {client.lastname}
      </strong>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDelete(client.id);
        }}
        style={{ marginLeft: "10px", color: "red" }}
      >
        Delete
      </button>
      <br />
      <p>Total Appointments: {client.appointments?.length || 0}</p>

      {isExpanded && (
        <div onClick={(e) => e.stopPropagation()}>
          <p>Email: {client.email}</p>
          <p>Birthday: {client.birthday}</p>
          <p>Phone: {client.phone}</p>

          <h4>Appointments:</h4>
          <ul>
            {(client.appointments || []).map((appt, index) => (
              <li key={index}>
                <p>Start: {appt.startTime}</p>
                <p>
                  End:{" "}
                  <input
                    type="datetime-local"
                    value={
                      appointmentEdits[index]?.endTime ??
                      appt.endTime ??
                      ""
                    }
                    onChange={(e) =>
                      handleAppointmentChange(
                        index,
                        "endTime",
                        e.target.value
                      )
                    }
                  />
                </p>
                <p>
                  Status:{" "}
                  <select
                    value={
                      appointmentEdits[index]?.status ?? appt.status
                    }
                    onChange={(e) =>
                      handleAppointmentChange(
                        index,
                        "status",
                        e.target.value
                      )
                    }
                  >
                    <option value="pending">Pending</option>
                    <option value="done">Done</option>
                    <option value="no-show">No Show</option>
                  </select>
                </p>
                <button onClick={() => handleAppointmentUpdate(index)}>
                  Save Appointment
                </button>
                <button
                  onClick={() => handleAppointmentDelete(index)}
                  style={{ color: "red", marginLeft: "10px" }}
                >
                  Cancel Appointment
                </button>
              </li>
            ))}
          </ul>

          <h5>Add New Appointment</h5>
          <form onSubmit={handleAddAppointment}>
            <input
              type="datetime-local"
              value={newAppointmentStart}
              onChange={(e) => setNewAppointmentStart(e.target.value)}
              required
            />
            <button type="submit">Add Appointment</button>
          </form>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditClientId(client.id);
              setEditData({
                firstname: client.firstname || "",
                lastname: client.lastname || "",
                phone: client.phone || "",
                birthday: client.birthday || "",
              });
            }}
          >
            Edit Profile
          </button>

          {isEditing && (
            <ClientForm
              editData={editData}
              setEditData={setEditData}
              isEdit
              onCancel={() => setEditClientId(null)}
              onSubmit={(e) => handleEditSubmit(e, client.id)}
            />
          )}
        </div>
      )}
    </li>
  );
};

export default ClientItem;
