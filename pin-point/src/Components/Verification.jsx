import React from 'react'

const Verification = () => {
  return (
    <>
      <div>Verification</div>
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
        <legend className="fieldset-legend">Enter Phone Number</legend>
        <input type="text" className="input" placeholder="Phone Number" />
      </fieldset>

      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
        <legend className="fieldset-legend">Enter Code</legend>
        <input type="text" className="input" placeholder="Code:" />
      </fieldset>
    </>
  )
}

export default Verification