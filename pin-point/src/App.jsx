import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from "react-router-dom"

import './App.css'
import Navbar from './Components/Navbar'
import Auth from "./Components/Auth"
import Home from "./Components/Home"
import Landing from "./Components/Landing"
// import Verification from './Components/Verification'
// import Survey from './Components/Survey'
import Account from './Components/Account'
import Footer from './Components/Footer'

function App() {
  const [token, setToken] = useState("")
  const [uid, setUid] = useState("")
  const navigate = useNavigate()

  // Update state and localStorage with token + uid after login/signup
  const updateToken = (passedToken, passedUid) => {
    localStorage.setItem("token", passedToken)
    localStorage.setItem("uid", passedUid)
    setToken(passedToken)
    setUid(passedUid)
  }

  // Clear session and navigate home
  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("uid")
    setToken("")
    setUid("")
    navigate("/")
  }

  // Navigate programmatically from components like Landing
  const handleNavigation = (route) => {
    console.log("button clicked");
    navigate(route)
  }

  // Load token and uid from storage on page refresh
  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    const storedUid = localStorage.getItem("uid")

    if (storedToken) setToken(storedToken)
    if (storedUid) setUid(storedUid)
  }, [])

  return (
    <div data-theme="nord" style={{ display: "flex", flexDirection: 'column', minHeight: "100dvh", justifyContent: "space-between" }}>
      <Navbar token={token} handleLogout={handleLogout} />

      <Routes>

        {/* Landing Page - Always accessible */}
        <Route path="/" element={<Landing handleNavigation={handleNavigation} />} />

        {/* Auth Route - Redirect to /home if already logged in */}
        <Route
          path="/auth"
          element={
            token ? (
              <Navigate to="/home" />
            ) : (
              <Auth updateToken={updateToken} />
            )
          }
        />

        {/* Home Route - Redirect to /auth if NOT logged in */}
        <Route
          path="/home"
          element={
            token ? (
              <Home token={token} uid={uid} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Verification - Optional gated flow */}
        {/* <Route path="/verification" element={<Verification />} /> */}

        {/* Survey - Optional gated flow */}
        {/* <Route path="/survey" element={<Survey />} /> */}

        {/* Account - Allow only if logged in */}
        <Route
          path="/account"
          element={
            token ? (
              <Account token={token} uid={uid} />
            ) : (
              <Navigate to="/auth" />
            )
          }
        />

      </Routes>

      <Footer />
    </div>
  )
}

export default App