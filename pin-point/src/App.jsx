import { useState, useEffect } from 'react'

import { Routes, Route, Navigate, useNavigate } from "react-router-dom"

import './App.css'
import Header from './Components/Navbar'
import Auth from "./Components/Auth"
import Home from "./Components/Home"
import Landing from "./Components/Landing"

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
      <div data-theme="Cupcake">

        {token && <button style={{ position: "absolute", top: 0, left: 0 }} onClick={handleLogout}>Logout</button>}
        <Header />
        <Routes>
          <Route path='/'
            element={
              !token ? <Landing handleNavigation={handleNavigation}/>
                : (<Navigate to="/Auth" />)
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


        </Routes>

      </div>
    )
  };

  export default App;
