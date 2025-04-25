import { useState, useEffect } from 'react'

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import './App.css'
import Header from './Components/Header'
import Auth from "./Components/Auth"
import Home from "./Components/Home"

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
    <div data-theme="Cupcake">
    <BrowserRouter>
      <Header />

      <Routes>
        {/* <Route
          path="/."
          element={
            !token ? (
              <Auth updateToken={updateToken} />
            ) : (
              <Navigate to="/" />
            )}
        /> */}

       
        <Route path='/' element={<Home />} />
        

      </Routes>
    </BrowserRouter>
    </div>
  )
};

export default App;
