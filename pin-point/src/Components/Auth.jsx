import React, { cloneElement, useEffect, useRef, useState } from "react";
import "./Components-css/Auth.css"
import { useNavigate } from "react-router-dom"


// The Auth component handles user signup and login
const Auth = ({ updateToken }) => {

  const [signup, setSignup] = useState(true);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [locationStatus, setLocationStatus] = useState('');

  const navigate = useNavigate()

  const firstNameRef = useRef();
  const lastNameRef = useRef();
  const emailRef = useRef(); //
  const passwordRef = useRef();
  const dateOfBirthRef = useRef();
  const zipCodeRef = useRef();
  const locationResolvedRef = useRef(false);


  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    console.log(urlParams.get("login"));
    if (urlParams.get("login")) {
      setSignup(false)
    }
  }, [])

  // obtain user geolocation or convert zipcode from backend file
  const resolveLocation = async () => {
    if (locationResolvedRef.current) return;
    locationResolvedRef.current = true;
    setLocationStatus("Requesting location...");
  
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
  
            setLatitude(lat);
            setLongitude(lng);
            setLocationStatus("Location retrieved, checking ZIP...");
  
            // Calling backend to perform a reverse lookup route
            try {
              const res = await fetch(`http://localhost:8080/map/reverse-zip?lat=${lat}&lng=${lng}`);
              const data = await res.json();
              if (res.ok) {
                zipCodeRef.current.value = data.zipCode;
                setLocationStatus(`Auto-filled ZIP: ${data.zipCode}`);
              } else {
                setLocationStatus("ZIP not found for this location");
              }
            } catch (err) {
              console.error("Reverse ZIP lookup failed:", err);
              setLocationStatus("ZIP lookup error");
            }
  
            resolve();
          },
  
          async () => {
            setLocationStatus("GPS denied, using ZIP fallback");
  
            const zip = zipCodeRef.current.value;
            if (!zip) {
              setLocationStatus("ZIP required for fallback");
              return resolve();
            }
  
            try {
              const res = await fetch(`http://localhost:8080/map/zip-centroid/${zip}`);
              const data = await res.json();
              if (res.ok) {
                setLatitude(data.latitude);
                setLongitude(data.longitude);
                setLocationStatus("ZIP centroid used");
              } else {
                setLocationStatus("ZIP not found");
              }
            } catch (err) {
              console.error("ZIP fallback error:", err);
              setLocationStatus("ZIP lookup failed");
            }
  
            resolve();
          }
        );
      } else {
        setLocationStatus("Geolocation not supported");
        resolve();
      }
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Form was submitted");

    try {
      const response = await fetch(
        `http://localhost:8080/users${signup ? "/signup" : "/login"}`,

        {
          method: "POST", // HTTP method
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({

            firstName: signup && firstNameRef.current.value,
            lastName: signup && lastNameRef.current.value,
            dateOfBirth: signup && dateOfBirthRef.current.value,
            email: emailRef.current.value,
            password: passwordRef.current.value,
            zipCode: signup && zipCodeRef.current.value,
            latitude: signup && latitude,
            longitude: signup && longitude,
          }),
        }
      );

      // Get the response as JSON
      const data = await response.json();

      console.log(data); // Log the response from the API

      if (data.Error) throw new Error(data.Error)

      updateToken(data.Token, data.User._id);

      navigate("/verification");
    } catch (err) {
      console.log(err.message);
    }
  };

  return (
    <div className="page flex flex-1 justify-center bg-accent">
    <div className="text-center border rounded bg-white m-4">
      <h2 className="my-2 ">{signup ? "👤Signup" : "👤Login"}</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 justify-center items-center pb-4 px-7 my-5 mx-7  ">
        {signup && (

          <>
            <input className="input input-accent" ref={firstNameRef} placeholder="First Name" required />
            <input className="input input-accent" ref={lastNameRef} placeholder="Last Name" required />
            {/* <input ref={dateOfBirthRef} placeholder="Date of Birth" required />{" "} */}
            <input className="input input-accent" ref={dateOfBirthRef} placeholder="Date of Birth" required type="date" />
            <input className="input input-accent" ref={zipCodeRef} placeholder="Zip Code" onClick={signup ? resolveLocation : undefined} />
            {signup && <p className="text-xs text-neutral">{locationStatus}</p>}
          </>
        )}

        <input className="input input-accent" ref={emailRef} placeholder="Email" required />
        <input className="input input-accent" ref={passwordRef} placeholder="Password" required />{" "}
        <button className="btn btn-accent">Submit</button> {/* Submit button */}
        <button
          type="button"
          onClick={() => {
            // When clicked, toggle the "signup" state to switch between signup and login
            setSignup(!signup);
          }}
        >
          {signup ? "Need to login?" : "Need to signup?"}
        </button>
      </form>
    </div>
    </div>
  );
};

export default Auth; // 

