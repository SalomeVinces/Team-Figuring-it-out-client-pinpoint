import { useState } from 'react'

import {BrowserRouter, Routes,Route} from "react-router-dom"

import './App.css'
import Home from './pages/Home'
import Service from './pages/Service'
import Contact from './pages/Contact'
import Header from './Components/header/Header'
import Auth from './pages/Auth'

function App () { 

  return (
    <BrowserRouter>
    <Header/>
     
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/services' element={<Service />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/auth' element={<Auth />} />
       
      </Routes>
    </BrowserRouter>
  )
};

export default App;
