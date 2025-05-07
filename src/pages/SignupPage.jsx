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
  const [appointment, setAppointment ] = useState('');
  const [phone, setPhone] = useState('');
  const [handleError, setHandleError] = useState('');
  const navigate = useNavigate();
  const [role, setRole] = useState('');



  const handleSignup = (e) => {
    e.preventDefault();
    const auth = getAuth(app);

    createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
        const user = userCredential.user;
        console.log("User signed up:", user);
        try {
          await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            role: role,
            firstname: firstname,
            lastname: lastname,
            birthday: birthday,
            appointment: appointment, 
            phone: phone
          });
      
          console.log("User role saved. Redirecting...");
          navigate("/login");
        } catch (err) {
          console.error("Error saving role:", err.message);
          setHandleError("Signup succeeded but failed to save user info.");
        }
      })      
  };

  return (
    <div>
      <h2>Sign Up</h2>
      {handleError ? <p>{handleError}</p> : <p>{handleError}</p> }
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
         <p>Client's firstname:</p>
         <input 
          type="text"
          placeholder='firstname'
          value={firstname}
          onChange={(e) => setFirstname(e.target.value)}
          required
        />
        <br />
        <p>Client's lastname:</p>
         <input 
          type="text"
          placeholder='lastname'
          value={lastname}
          onChange={(e) => setLastname(e.target.value)}
          required
        />
        <br />
        <p>Birthday</p>
        <input
          type='date'
          placeholder='Birthday'
          value={birthday}
          onChange={(e) => setBirthday(e.target.value)}
          required
        />
        <br />
        <p>Appointment Date</p>
        <input
          type="datetime-local"
          value={appointment}
          onChange={(e) => setAppointment(e.target.value)}
          required
        />
        <br />
        <p>Phone number</p>
        <input
          type="tel"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <br />
        <select value={role} onChange={(e) => setRole(e.target.value)} required>
            <option value="">Select Role</option>
            <option value="tester">Tester</option>
            <option value="client">Client</option>
        </select>
        <br />
        <button type="submit">Create Account</button>
      </form>
      <p>Already have an account? <Link to="/login">Log in</Link></p>
    </div>
  );
};

export default SignupPage;
