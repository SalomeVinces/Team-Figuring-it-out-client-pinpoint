import React from 'react'
import "./Components-css/Header.css";
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header>
    <div className="logo"> <h1>🪄Pin-Point </h1></div>
    <nav>
      <Link to="/">Home</Link>
      {/* <Link to="/services">Services</Link>
      <Link to="/contact">Contact</Link>
      <Link to="/auth">Authentication</Link> */}
     
    </nav>
  </header>
  )
}

export default Header