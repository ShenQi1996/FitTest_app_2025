import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import { getAuth, signOut } from "firebase/auth";
import { collection, getDocs, query, where, doc, updateDoc, addDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

const TesterDashboardPage = () => {
  const navigate = useNavigate();
  const { email, role } = useSelector((state) => state.user);
  const [clients, setClients] = useState([]);
  const [expandedClientId, setExpandedClientId] = useState(null);
  const [editData, setEditData] = useState({});
  const [editClientId, setEditClientId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [appointmentClientId, setAppointmentClientId] = useState(null);
  const [newAppointmentTime, setNewAppointmentTime] = useState("");



  useEffect(() => {
    const fetchClients = async () => {
      try {
        const q = query(collection(db, "users"), where("role", "==", "client"));
        const querySnapshot = await getDocs(q);
        const clientList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setClients(clientList);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };
  
    fetchClients();
  }, []);

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        console.log("User signed out");
        navigate("/login");
      })
      .catch((error) => {
        console.error("Logout error:", error.message);
      });
  };

  const toggleExpand = (clientId) => {
    setExpandedClientId(expandedClientId === clientId ? null : clientId);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDelete = async (clientId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this client?");
    if (!confirmDelete) return;
  
    try {
      await deleteDoc(doc(db, "users", clientId));
      setClients(prev => prev.filter(client => client.id !== clientId));
      if (expandedClientId === clientId) setExpandedClientId(null); // collapse if deleted
    } catch (error) {
      console.error("Error deleting client:", error);
    }
  };
  

  return (
    <div>
      <h2>Welcome to your Dashboard</h2>
      <p>Email: {email}</p>
      <p>Role: {role}</p>

      {/* Add New Client */}
      <button onClick={() => setShowAddForm(prev => !prev)}>
        {showAddForm ? "Cancel" : "Add Client"}
      </button>
      {showAddForm && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              const newClient = {
                role: "client",
                firstname: editData.firstname || "",
                lastname: editData.lastname || "",
                email: editData.email || "",
                phone: editData.phone || "",
                appointment: {
                  startTime: editData.appointment?.startTime || "",
                  endTime: editData.appointment?.endTime || "",
                  status: editData.appointment?.status || "pending"
                },
                birthday: editData.birthday || "",
              };
              const docRef = await addDoc(collection(db, "users"), newClient);
              setClients(prev => [...prev, { id: docRef.id, ...newClient }]);
              setEditData({});
              setEditData({
                appointment: {
                  startTime: "",
                  endTime: "",
                  status: "pending"
                }
              });
              setShowAddForm(false); // hide form after adding
              alert("Client added!");
            } catch (error) {
              console.error("Error adding client:", error);
            }
          }}
        >
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
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={editData.email || ""}
              onChange={handleInputChange}
              required
            />
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
              onChange={(e) =>
                setEditData((prev) => ({
                  ...prev,
                  appointment: {
                    ...prev.appointment,
                    startTime: e.target.value,
                  },
                }))
              }
            />
            <input
              type="datetime-local"
              name="endTime"
              value={editData.appointment?.endTime || ""}
              onChange={(e) =>
                setEditData((prev) => ({
                  ...prev,
                  appointment: {
                    ...prev.appointment,
                    endTime: e.target.value,
                  },
                }))
              }
            />
            <select
              name="status"
              value={editData.appointment?.status || "pending"}
              onChange={(e) =>
                setEditData((prev) => ({
                  ...prev,
                  appointment: {
                    ...prev.appointment,
                    status: e.target.value,
                  },
                }))
              }
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
            <button type="submit">Add Client</button>
        </form>
      )}

       <h3>Client List</h3>
       <ul>
         {clients.length === 0 && <p>No clients found.</p>}
         {clients.map(client => (
           <li key={client.id} onClick={() => toggleExpand(client.id)}>
             <strong>{client.firstname} {client.lastname}</strong>
             <button
              onClick={(e) => {
                e.stopPropagation(); // prevent triggering expand
                handleDelete(client.id);
              }}
              style={{ marginLeft: '10px', color: 'red' }}
              >
               Delete
             </button>
             <br />
             Appointment start time: {client.appointment?.startTime}
             <br />
             {expandedClientId === client.id && (
              <div onClick={(e) => e.stopPropagation()}>
                {editClientId !== client.id ? (
                  <>
                    <p>Email: {client.email}</p>
                    <p>Birthday: {client.birthday}</p>
                    <p>Role: {client.role}</p>
                    <p>First Name: {client.firstname}</p>
                    <p>Last Name: {client.lastname}</p>
                    <p>Phone: {client.phone}</p>
                    <p>Appointment end time: {client.appointment.endTime || "pending"}</p>
                    <p>Appointment Status: {client.appointmentStatus || "pending"}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditClientId(client.id);
                        setEditData({
                          firstname: client.firstname || "",
                          lastname: client.lastname || "",
                          phone: client.phone || "",
                          appointment: {
                            startTime: client.appointment?.startTime || "",
                            endTime: client.appointment?.endTime || "",
                            status: client.appointment?.status || "pending"
                          },
                          birthday: client.birthday || "",
                        });
                      }}
                    >
                      Edit
                    </button>
                  </>
                ) : (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      try {
                        await updateDoc(doc(db, "users", client.id), editData);
                        alert("Client updated!");
                        setClients(prev =>
                          prev.map(c =>
                            c.id === client.id ? { ...c, ...editData } : c
                          )
                        );
                        setEditClientId(null);
                      } catch (error) {
                        console.error("Error updating client:", error);
                      }
                    }}
                  >
                    <input
                      type="text"
                      name="firstname"
                      value={editData.firstname}
                      onChange={handleInputChange}
                      required
                    />
                    <input
                      type="text"
                      name="lastname"
                      value={editData.lastname}
                      onChange={handleInputChange}
                      required
                    />
                    <input
                      type="tel"
                      name="phone"
                      value={editData.phone}
                      onChange={handleInputChange}
                      required
                    />
                    <input
                      type="datetime-local"
                      name="startTime"
                      value={editData.appointment?.startTime || ""}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          appointment: {
                            ...prev.appointment,
                            startTime: e.target.value,
                          },
                        }))
                      }
                    />
                    <input
                      type="datetime-local"
                      name="endTime"
                      value={editData.appointment?.endTime || ""}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          appointment: {
                            ...prev.appointment,
                            endTime: e.target.value,
                          },
                        }))
                      }
                    />
                    <select
                      name="status"
                      value={editData.appointment?.status || "pending"}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          appointment: {
                            ...prev.appointment,
                            status: e.target.value,
                          },
                        }))
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="done">Done</option>
                      <option value="no-show">No Show</option>
                    </select>
                    <input
                      type="date"
                      name="birthday"
                      value={editData.birthday}
                      onChange={handleInputChange}
                      required
                    />
                    <button type="submit">Save</button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditClientId(null);
                      }}
                    >
                      Cancel
                    </button>
                  </form>
                )}
              </div>
            )}

             <br />
           </li>
         ))}
       </ul>
      <button onClick={handleLogout}>Log Out</button>
    </div>
  );
};

export default TesterDashboardPage;

