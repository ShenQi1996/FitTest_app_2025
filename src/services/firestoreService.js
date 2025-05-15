import { db } from "../firebase";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";

/**
 * Real-time listener for all clients.
 * @param {Function} onData   called with an array of {id, ...data}
 * @param {Function} onError  called on error
 * @returns unsubscribe()      call to detach listener
 */
export const listenToClients = (onData, onError) => {
  const q = query(collection(db, "users"), where("role", "==", "client"));
  return onSnapshot(
    q,
    snap => {
      const clients = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      onData(clients);
    },
    onError
  );
};

/** Create a new client document */
export const addClient = clientData =>
  addDoc(collection(db, "users"), clientData);

/** Update arbitrary fields on a client */
export const updateClient = (clientId, data) =>
  updateDoc(doc(db, "users", clientId), data);

/** Delete a client by ID */
export const deleteClient = clientId => deleteDoc(doc(db, "users", clientId));

/** Fetch a single client once */
export const getClient = async clientId => {
  const snap = await getDoc(doc(db, "users", clientId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

/**
 * Real-time listener for one client’s data.
 * @param {string}   clientId
 * @param {Function} onData     called with {id, ...data}
 * @param {Function} onError
 * @returns unsubscribe()
 */
export const listenToClient = (clientId, onData, onError) =>
  onSnapshot(
    doc(db, "users", clientId),
    snap => onData(snap.exists() ? { id: snap.id, ...snap.data() } : null),
    onError
  );

/** Overwrite the entire appointments array */
export const updateAppointments = (clientId, appointments) =>
  updateDoc(doc(db, "users", clientId), { appointments });
