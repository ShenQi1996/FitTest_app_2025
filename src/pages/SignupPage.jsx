// src/pages/SignupPage.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { app, db } from '../firebase.js';
import { doc, setDoc } from 'firebase/firestore';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [lastname, setLastname] = useState('');
  const [firstname, setFirstname] = useState('');
  const [birthday, setBirthday] = useState('');
  const [phone, setPhone] = useState('');
  const [handleError, setHandleError] = useState('');
  const [role, setRole] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    const auth = getAuth(app);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role,
        firstname,
        lastname,
        birthday,
        phone
      });

      navigate("/login");
    } catch (err) {
      console.error("Signup error:", err);
      setHandleError("Failed to create account: " + err.message);
    }
  };

  return (
    <div>
      <h2>Sign Up</h2>
      {handleError && <p style={{ color: 'red' }}>{handleError}</p>}
      <form onSubmit={handleSignup}>
        <p>Email:</p>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        /><br />

        <p>Password:</p>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        /><br />

        <p>First Name:</p>
        <input
          type="text"
          placeholder="First Name"
          value={firstname}
          onChange={(e) => setFirstname(e.target.value)}
          required
        /><br />

        <p>Last Name:</p>
        <input
          type="text"
          placeholder="Last Name"
          value={lastname}
          onChange={(e) => setLastname(e.target.value)}
          required
        /><br />

        <p>Birthday:</p>
        <input
          type="date"
          value={birthday}
          onChange={(e) => setBirthday(e.target.value)}
          required
        /><br />

        <p>Phone Number:</p>
        <input
          type="tel"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        /><br />

        <p>Role:</p>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
        >
          <option value="client">Client</option>
        </select><br />

        <button type="submit">Create Account</button>
      </form>

      <p>
        Already have an account? <Link to="/login">Log in here</Link>
      </p>
    </div>
  );
};

export default SignupPage;
