import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '../slices/userSlice';
import { Link, useNavigate } from 'react-router-dom';
import { signIn } from '../services/authService';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      // Authenticate
      const userCredential = await signIn(email, password);
      const user = userCredential.user;

      // Fetch and store role
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const { role } = userDoc.data();
        dispatch(setUser({ email: user.email, role }));

        // Redirect based on role
        if (role === 'tester') {
          navigate('/tester-dashboard');
        } else if (role === 'client') {
          navigate('/client-dashboard');
        } else {
          setLoginError('Unrecognized role.');
        }
      } else {
        setLoginError('No user data found.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setLoginError(err.message);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {loginError && <p style={{ color: 'red' }}>{loginError}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        /><br />
        <button type="submit">Log In</button>
      </form>
      <p>
        Don't have an account? <Link to="/signup">Sign up here</Link>
      </p>
    </div>
  );
};

export default LoginPage;
