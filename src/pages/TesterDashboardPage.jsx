
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getAuth, signOut } from "firebase/auth";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  deleteDoc
} from "firebase/firestore";
import { db } from "../firebase";
// Components
import ClientForm from "../components/ClientForm";
import ClientItem from "../components/ClientItem";

const TesterDashboardPage = () => {
  const navigate = useNavigate();
  const { email, role } = useSelector((state) => state.user);
  const [clients, setClients] = useState([]);
  const [expandedClientId, setExpandedClientId] = useState(null);
  const [editData, setEditData] = useState({});
  const [editClientId, setEditClientId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // compute current datetime-local min value
  const nowLocal = new Date().toISOString().slice(0, 16);

  useEffect(() => {
    // Real-time subscription to clients
    const q = query(collection(db, "users"), where("role", "==", "client"));
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setClients(list);
      },
      (err) => console.error("Error fetching clients:", err)
    );
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => navigate("/login"))
      .catch((err) => console.error("Logout error:", err.message));
  };

  const toggleExpand = (clientId) =>
    setExpandedClientId((prev) => (prev === clientId ? null : clientId));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (clientId) => {
    if (!window.confirm("Are you sure you want to delete this client?")) return;
    try {
      await deleteDoc(doc(db, "users", clientId));
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

      {/* Add New Client */}
      <button onClick={() => setShowAddForm((p) => !p)}>
        {showAddForm ? "Cancel" : "Add Client"}
      </button>
      {showAddForm && (
        <ClientForm
          editData={editData}
          setEditData={setEditData}
          onSubmit={async (e) => {
            e.preventDefault();
            // Validate appointment dates
            const start = editData.appointment?.startTime;
            const end = editData.appointment?.endTime;
            if (start && start < nowLocal) {
              alert("Appointment start time cannot be in the past.");
              return;
            }
            if (start && end && end < start) {
              alert("End time must be after start time.");
              return;
            }

            try {
              const newClient = {
                role: "client",
                firstname: editData.firstname || "",
                lastname: editData.lastname || "",
                email: editData.email || "",
                phone: editData.phone || "",
                appointment: {
                  startTime: start || "",
                  endTime: end || "",
                  status: editData.appointment?.status || "pending",
                },
                birthday: editData.birthday || "",
              };
              await addDoc(collection(db, "users"), newClient);
              setEditData({
                appointment: { startTime: "", endTime: "", status: "pending" },
              });
              setShowAddForm(false);
              alert("Client added!");
            } catch (err) {
              console.error("Error adding client:", err);
            }
          }}
        />
      )}

      {/* Client List */}
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
            handleEditSubmit={async (e, clientId) => {
              e.preventDefault();
              try {
                await updateDoc(doc(db, "users", clientId), editData);
                setEditClientId(null);
                alert("Client updated!");
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
