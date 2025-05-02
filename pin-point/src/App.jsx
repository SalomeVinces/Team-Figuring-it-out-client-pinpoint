import { useState, useEffect } from 'react'

import { Routes, Route, Navigate, useNavigate } from "react-router-dom"

import './App.css'
import Navbar from './Components/Navbar'
import Auth from "./Components/Auth"
import Home from "./Components/Home"
import Landing from "./Components/Landing"
import Verification from './Components/Verification'
import Survey from './Components/Survey'

function App() {
  const [token, setToken] = useState("")
  const navigate = useNavigate()

  // Update state token variable, and store it in localStorage
  const updateToken = (passedToken, uid) => {
    localStorage.setItem("token", passedToken);
    localStorage.setItem("uid", uid);
    setToken(passedToken);
  }

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("uid");
    setToken("");
    navigate("/")
  }

  const handleNavigation = (route) => {
    navigate(route)
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, [])

  return (
    <>
      <div data-theme="forest">
        <Navbar />

        {token && <button style={{ position: "absolute", top: 0, right: 0 }} onClick={handleLogout}>Logout</button>}

        <Routes>
          
          <Route path='/'
            element={
              !token ? <Landing handleNavigation={handleNavigation} />
                : (<Navigate to ="/Auth" />)
            } />

          <Route
            path="/Auth"
            element={
              !token ? (
                <Auth updateToken={updateToken} />
              ) : (
                <Navigate to="/home" />
              )}
          />

          <Route path='/home' element={<Home />} />
          
          {/* Verify routes once verification backend is connected and verify survey route */}
          
          <Route path="/verification" element ={ <Verification/>} />

          <Route path ="/survey" element={<Survey/>} />

        </Routes>

      </div>
    </>
  )
};

export default App;
