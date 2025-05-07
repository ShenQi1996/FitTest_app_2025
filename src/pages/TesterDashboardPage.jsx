import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import { getAuth, signOut } from "firebase/auth";
import { collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

const TesterDashboardPage = () => {
  const navigate = useNavigate();
  const { email, role } = useSelector((state) => state.user);
  const [clients, setClients] = useState([]);
  const [expandedClientId, setExpandedClientId] = useState(null);
  const [editData, setEditData] = useState({});
  const [editClientId, setEditClientId] = useState(null);

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


  return (
    <div>
      <h2>Welcome to your Dashboard</h2>
      <p>Email: {email}</p>
      <p>Role: {role}</p>

       <h3>Client List</h3>
       <ul>
         {clients.length === 0 && <p>No clients found.</p>}
         {clients.map(client => (
           <li key={client.id} onClick={() => toggleExpand(client.id)}>
             <strong>{client.firstname} {client.lastname}</strong>
             <br />
             Phone: {client.phone}
             <br />
             Appointment: {client.appointment}
             <br />
             {expandedClientId === client.id && (
              <div onClick={(e) => e.stopPropagation()}>
                <p>Email: {client.email}</p>
                <p>Birthday: {client.birthday}</p>
                <p>Role: {client.role}</p>

                {editClientId !== client.id ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditClientId(client.id);
                        setEditData({
                          phone: client.phone,
                          appointment: client.appointment,
                          // add more fields as needed
                        });
                      }}
                    >
                      Edit
                    </button>
                  ) : (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        try {
                          await updateDoc(doc(db, "users", client.id), editData);
                          alert("Client updated!");

                          // update local state
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
                      <p>
                        Phone:
                        <input
                          type="tel"
                          name="phone"
                          value={editData.phone || ""}
                          onChange={handleInputChange}
                        />
                      </p>
                      <p>
                        Appointment:
                        <input
                          type="datetime-local"
                          name="appointment"
                          value={editData.appointment || ""}
                          onChange={handleInputChange}
                        />
                      </p>
                      {/* Add more inputs here if needed */}

                      <button type="submit">Save</button>
                      <button type="button" onClick={() => setEditClientId(null)}>
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

