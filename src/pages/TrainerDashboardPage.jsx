import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import { getAuth, signOut } from "firebase/auth";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";


const TrainerDashboardPage = () => {
  const navigate = useNavigate();
  const { email, role } = useSelector((state) => state.user);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [categary, setCategary] = useState("");
  const [duration, setDuration] = useState("");
  const [level, setLevel] = useState("");

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

  const handleCreateWorkout = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "workouts"), {
        categary,
        title,
        duration,
        level,
        createdBy: email, // from Redux
        createdAt: serverTimestamp(),
        description,
        videoUrl,
      });
      setMessage("Workout plan created!");
      setTitle("");
      setDescription("");
      setVideoUrl("");
      setCategary("");
      setDuration("");
      setLevel("");
    } catch (error) {
      console.error("Error adding workout:", error);
      setMessage("Failed to create workout.");
    }
  };

  return (
    <div>
      <h2>Welcome to your Dashboard</h2>
      <p>Email: {email}</p>
      <p>Role: {role}</p>
      <h3>Create Workout Plan</h3>
      <form onSubmit={handleCreateWorkout}>
        <select value={categary} onChange={(e) => setCategary(e.target.value)} required>
            <option value="">Select a categary</option>
            <option value="1">type 1</option>
            <option value="2">type 2</option>
            <option value="3">type 3</option>
        </select>
        <br />
        <input
          type="text"
          placeholder="Workout Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <br />
        <select value={level} onChange={(e) => setLevel(e.target.value)} required>
            <option value="">Select a Level</option>
            <option value="1">level 1</option>
            <option value="2">level 2</option>
            <option value="3">level 3</option>
        </select>
        <br />
        <select value={duration} onChange={(e) => setDuration(e.target.value)} required>
            <option value="">Select the duration</option>
            <option value="15">15 mins</option>
            <option value="20">20 mins</option>
            <option value="30">30 mins</option>
        </select>
        <br />
        <textarea
          placeholder="Workout Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <br />
        <input 
          type="url"
          placeholder="Workout video url (optional)"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
        />
        <br />
        <button type="submit">Create Workout</button>
      </form>
      {message && <p>{message}</p>}

      <button onClick={handleLogout}>Log Out</button>
    </div>
  );
};

export default TrainerDashboardPage;

