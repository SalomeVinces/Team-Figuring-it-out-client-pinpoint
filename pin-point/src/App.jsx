import { useState, useEffect } from 'react'

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import './App.css'
import Home from './pages/Home'
import Service from './pages/Service'
import Contact from './pages/Contact'
import Header from './Components/header/Header'
import Auth from './pages/Auth'

function App() {
  const [token, setToken] = useState("")

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
  }

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, [])

  return (
    <BrowserRouter>
      <Header />

      <Routes>
        <Route
          path="/"
          element={
            !token ? (
              <Auth updateToken={updateToken} />
            ) : (
              <Navigate to="/" />
            )}
        />

        {/* <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/services' element={<Service />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/auth' element={<Auth />} /> */}

      </Routes>
    </BrowserRouter>
  )
};

export default App;
