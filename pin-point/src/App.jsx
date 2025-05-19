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
      <div data-theme="nord" style={{ display: "flex", flexDirection: 'column', minHeight: "100dvh", justifyContent: "space-between" }}>
        <Navbar token={token} handleLogout={handleLogout} />

        <Routes>
          
          <Route path='/' element={!token ? <Landing handleNavigation={navigate} /> : <Navigate to="/home" />} />

          <Route path='/auth' element={!token ? <Auth updateToken={updateToken} /> : <Navigate to="/home" />} />

            {/* ? */}
          {/* <Route path="/verification" element={<Verification />} /> */}
          {/* <Route path="/survey" element={<Survey />} /> */}

          <Route path="/home" element={<Home token={token} uid={uid} />} />
          <Route path="/account" element={<Account />} />

        </Routes>

        <Footer />

      </div>
    </>
  )
};

export default App;
