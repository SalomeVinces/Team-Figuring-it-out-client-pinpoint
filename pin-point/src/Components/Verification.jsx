import React from 'react'
import { useNavigate } from 'react-router-dom';

const Verification = () => {
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Success, verification completed");


    try {

     

      navigate("/survey");
    } catch (err) {
      console.log(err.message);
    }
  };
  return (
    <div className="page text-center flex flex-col justify-center items-center gap-3">
      <div>Verification</div>
      <fieldset className="fieldset bg-base-200 border-info rounded-box w-xs border p-4">
        <legend className="fieldset-legend">Enter Phone Number</legend>
        <input type="text" className="input input-info" placeholder="Phone Number" />
      </fieldset>
      <button className="btn btn-info" >Send Code</button>

      <fieldset className="fieldset bg-base-200 border-info rounded-box w-xs border p-4">
        <legend className="fieldset-legend">Enter Code</legend>
        <input type="text" className="input input-info" placeholder="Code:" />
      </fieldset>
      <button className="btn btn-info" onClick={handleSubmit}>Submit</button>
    </div>
  )
}

export default Verification