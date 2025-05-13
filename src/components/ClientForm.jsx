// src/components/ClientForm.jsx

import React from "react";

const ClientForm = ({
  editData,
  setEditData,
  onSubmit,
  isEdit = false,
  onCancel
}) => {
  // compute current datetime-local min value
  const nowLocal = new Date().toISOString().slice(0, 16);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAppointmentChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      appointment: {
        ...prev.appointment,
        [name]: value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const start = editData.appointment?.startTime;
    const end = editData.appointment?.endTime;

    if (start && start < nowLocal) {
      alert("Appointment start time cannot be in the past.");
      return;
    }
    if (start && end && end < start) {
      alert("Appointment end time must be after start time.");
      return;
    }

    onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="firstname"
        placeholder="First Name"
        value={editData.firstname || ""}
        onChange={handleInputChange}
        required
      />
      <input
        type="text"
        name="lastname"
        placeholder="Last Name"
        value={editData.lastname || ""}
        onChange={handleInputChange}
        required
      />
      {!isEdit && (
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={editData.email || ""}
          onChange={handleInputChange}
          required
        />
      )}
      <input
        type="tel"
        name="phone"
        placeholder="Phone"
        value={editData.phone || ""}
        onChange={handleInputChange}
      />
      <input
        type="datetime-local"
        name="startTime"
        value={editData.appointment?.startTime || ""}
        onChange={handleAppointmentChange}
        min={nowLocal}
      />
      <input
        type="datetime-local"
        name="endTime"
        value={editData.appointment?.endTime || ""}
        onChange={handleAppointmentChange}
        // cannot end before start
        min={editData.appointment?.startTime || nowLocal}
      />
      <select
        name="status"
        value={editData.appointment?.status || "pending"}
        onChange={handleAppointmentChange}
      >
        <option value="pending">Pending</option>
        <option value="done">Done</option>
        <option value="no-show">No Show</option>
      </select>
      <input
        type="date"
        name="birthday"
        value={editData.birthday || ""}
        onChange={handleInputChange}
      />
      <button type="submit">{isEdit ? "Save" : "Add Client"}</button>
      {isEdit && <button type="button" onClick={onCancel}>Cancel</button>}
    </form>
  );
};

export default ClientForm;
