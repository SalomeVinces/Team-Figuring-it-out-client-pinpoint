
import React, { useRef, useState } from "react";



// The Auth component handles user signup and login
const Auth = ({ updateToken }) => {
 
  const [signup, setSignup] = useState(true);

 
  const firstNameRef = useRef();
  const lastNameRef = useRef();
  const emailRef = useRef(); //
  const passwordRef = useRef();

  const navigate = useNavigate();

  
  const handleSubmit = async (e) => {
    e.preventDefault(); 

    console.log("Form was submitted"); 

    try {
      r
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
            email: emailRef.current.value,
            password: passwordRef.current.value,
          }),
        }
      );

      // Get the response as JSON
      const data = await response.json();

      console.log(data); // Log the response from the API

      

      updateToken(data.Token, data.User._id);

      navigate("/rooms");
    } catch (err) {
      console.log(err); 
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      
    
      <h2>{signup ? "Signup" : "Login"}</h2>
      
      {signup && (
        <>
        

          <input ref={firstNameRef} placeholder="First Name" required />{" "}
          <input ref={lastNameRef} placeholder="Last Name" required />{" "}
        </>
      )}
     
      <input ref={emailRef} placeholder="Email" required />
      <input ref={passwordRef} placeholder="Password" required />{" "}
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
  );
};

export default Auth; // 

