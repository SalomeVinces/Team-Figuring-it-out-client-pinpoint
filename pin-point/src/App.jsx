import { useState, useEffect } from 'react'

import { Routes, Route, Navigate, useNavigate } from "react-router-dom"

import './App.css'
import Navbar from './Components/Navbar'
import Auth from "./Components/Auth"
import Home from "./Components/Home"
import Landing from "./Components/Landing"
import Verification from './Components/Verification'
import Survey from './Components/Survey'
import Account from './Components/Account'
import Footer from './Components/Footer'

function App() {
  const [token, setToken] = useState("")
  const [uid, setUid] = useState("")
  const navigate = useNavigate()

  // Update state token variable, and store it in localStorage
  const updateToken = (passedToken, uid) => {
    localStorage.setItem("token", passedToken);
    localStorage.setItem("uid", uid);
    setToken(passedToken);
    setUid(uid)
  }

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("uid");
    setToken("");
    setUid("")
    navigate("/")
  }

  const handleNavigation = (route) => {
    navigate(route)
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUid = localStorage.getItem("uid")

    if (storedToken) {
      setToken(storedToken);
    }

    if (storedUid) {
      setUid(storedUid);
    }

  }, [])

  return (
    <>
      <div data-theme="nord">
        <Navbar token={token} handleLogout={handleLogout} />

        {/* {token && <button style={{ position: "absolute", top: 0, right: 0 }} onClick={handleLogout}>Logout</button>} */}

        <Routes>

          <Route path='/'
            element={
           <Landing handleNavigation={handleNavigation} />
            } />

          {/* <Route
            path="/Auth"
            element={
              !token ? (
                <Auth updateToken={updateToken} />
              ) : (
                <Navigate to="/home" />
              )}
          /> */}
          <Route
            path="/Auth"
            element={
              (
                <Auth updateToken={updateToken} />
              )}
          />

          {token ? (
            <Route path="/home" element={<Home token={token} uid={uid} />} />
          ) : (
            <Route path="/home" element={<Navigate to="/auth" />} />
          )}

          {/* Verify routes once verification backend is connected and verify survey route */}
          <Route path="/verification" element={<Verification />} />

          <Route path="/survey" element={<Survey />} />

          //! NEED TO ADD THIS LATER
          <Route path="/account" element={<Account />} />

        </Routes>

        <Footer />

      </div>
    </>
  )
};

export default App;
