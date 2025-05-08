import React from 'react'
import { Link } from 'react-router-dom';
const HomePage = () => {
  return (
    <div> 
    <h1>HomePage</h1>
    <p>Have an account? <Link to="/login">Login here</Link></p>
    <p>Don't have an account? <Link to="/signup">Sign up here</Link></p>
    </div>
  )
}

export default HomePage