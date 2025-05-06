import React, { cloneElement, useEffect, useRef, useState } from "react";
import "./Components-css/Auth.css"
import { useNavigate } from "react-router-dom"


// The Auth component handles user signup and login
const Auth = ({ updateToken }) => {

  const [signup, setSignup] = useState(true);
  const navigate = useNavigate()

  const firstNameRef = useRef();
  const lastNameRef = useRef();
  const emailRef = useRef(); //
  const passwordRef = useRef();
  const dateOfBirthRef = useRef();
  const zipCodeRef = useRef();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    console.log(urlParams.get("login"));
    if (urlParams.get("login")) {
      setSignup(false)
    }
  }, [])

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
          }),
        }
      );

      // Get the response as JSON
      const data = await response.json();

      console.log(data); // Log the response from the API

      if (data.Error) throw new Error(data.Error)

      updateToken(data.Token, data.User._id);

      navigate("/home");
    } catch (err) {
      console.log(err.message);
    }
  };

  return (
    <div className="page text-center">
      <h2 className="my-2">{signup ? "Signup" : "Login"}</h2>
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 justify-center items-center pb-4 ">
      {signup && (

        <>
          <input className="input input-accent" ref={firstNameRef} placeholder="First Name" required />{" "}
          <input className="input input-accent" ref={lastNameRef} placeholder="Last Name" required />{" "}
          {/* <input ref={dateOfBirthRef} placeholder="Date of Birth" required />{" "} */}
          <input className="input input-accent" ref={dateOfBirthRef} placeholder="Date of Birth" required type="date" />{" "}
          <input className="input input-accent" ref={zipCodeRef} placeholder="Zip Code" />{" "}
        </>
      )}

      <input className="input input-accent" ref={emailRef} placeholder="Email" required />
      <input className="input input-accent" ref={passwordRef} placeholder="Password" required />{" "}
      <button>Submit</button> {/* Submit button */}
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
  );
};

export default Auth; // 

