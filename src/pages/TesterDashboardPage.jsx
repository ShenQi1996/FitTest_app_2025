import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getAuth, signOut } from "firebase/auth";
import {
  listenToClients,
  addClient,
  updateClient,
  deleteClient,
} from "../services/firestoreService";
import ClientForm from "../components/ClientForm";
import ClientItem from "../components/ClientItem";

const TesterDashboardPage = () => {
  const navigate = useNavigate();
  const { email, role } = useSelector((state) => state.user);

  const [clients, setClients] = useState([]);
  const [expandedClientId, setExpandedClientId] = useState(null);
  const [editClientId, setEditClientId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const unsubscribe = listenToClients(
      setClients,
      (err) => console.error("Error fetching clients:", err)
    );
    return unsubscribe;
  }, []);

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => navigate("/login"))
      .catch((err) => console.error("Logout error:", err.message));
  };

  const toggleExpand = (clientId) =>
    setExpandedClientId((prev) => (prev === clientId ? null : clientId));

  const handleDelete = async (clientId) => {
    if (!window.confirm("Are you sure you want to delete this client?"))
      return;
    try {
      await deleteClient(clientId);
      if (expandedClientId === clientId) setExpandedClientId(null);
    } catch (err) {
      console.error("Error deleting client:", err);
    }
  };

  const updateClientInList = (updated) =>
    setClients((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );

  return (
    <div>
      <h2>Welcome to your Dashboard</h2>
      <p>Email: {email}</p>
      <p>Role: {role}</p>

      <button onClick={() => setShowAddForm((prev) => !prev)}>
        {showAddForm ? "Cancel" : "Add Client"}
      </button>

      {showAddForm && (
        <ClientForm
          editData={editData}
          setEditData={setEditData}
          showAppointmentFields={false}        // hide appointment inputs here
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await addClient({
                role: "client",
                firstname: editData.firstname || "",
                lastname: editData.lastname || "",
                email: editData.email || "",
                phone: editData.phone || "",
                birthday: editData.birthday || "",
              });
              setShowAddForm(false);
              setEditData({});
            } catch (err) {
              console.error("Error adding client:", err);
            }
          }}
        />
      )}

      <h3>Client List</h3>
      <ul>
        {clients.length === 0 && <p>No clients found.</p>}
        {clients.map((client) => (
          <ClientItem
            key={client.id}
            client={client}
            isExpanded={expandedClientId === client.id}
            isEditing={editClientId === client.id}
            toggleExpand={toggleExpand}
            setEditClientId={setEditClientId}
            handleDelete={handleDelete}
            editData={editData}
            setEditData={setEditData}
            handleEditSubmit={async (e, id) => {
              e.preventDefault();
              try {
                await updateClient(id, editData);
                updateClientInList({ id, ...editData });
                setEditClientId(null);
              } catch (err) {
                console.error("Error updating client:", err);
              }
            }}
            updateClientInList={updateClientInList}
          />
        ))}
      </ul>

      <button onClick={handleLogout}>Log Out</button>
    </div>
  );
};

export default TesterDashboardPage;
