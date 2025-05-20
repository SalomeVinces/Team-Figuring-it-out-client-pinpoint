import React, { useEffect, useState } from "react";
import "./Components-css/Navbar.css";
import { useNavigate } from "react-router-dom";
import pinpointLogo from "../assets/PinPoint.png"

const Navbar = ({ token, handleLogout }) => {
  const [hideAuth, setHideAuth]=useState(false)
  const navigate = useNavigate()
  useEffect(() =>{
    if(window.location.pathname.includes("/auth")){
      setHideAuth(true)
    }
  },[])

  return (

    <div className="navbar bg-base-300 shadow-sm ">
      <div className="navbar-start">
        {/*  logo */}
        <img src={pinpointLogo} alt="Pinpoint Icon" className="w-15 h-15 rounded-full scale-125" />
        {/* <a className="ghost text-3xl text-black tagesschrift-regular">PinPoint</a> */}
      </div>
      {/* navebar */}
      <div className="navbar-end">
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {" "}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h7"
              />{" "}
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
          >


            {token ? (
              <>
                <li>
                  <a onClick={() => {

                    navigate("/home")
                  }}>Homepage</a>
                </li>

                <li>
                  <a onClick={() => { navigate("/account") }} >Account</a>
                </li>

                <li>
                  <a onClick={() => { handleLogout() }} >Logout</a>
                </li>
              </>
            ) : ( hideAuth ? null : 
              <li>
                <a onClick={() => { navigate("/auth") }} >Signup/Login</a>
              </li>
            )
            }
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
