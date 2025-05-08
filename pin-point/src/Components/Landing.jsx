import React, { useState } from 'react'
// import Header from "./Header"

const Landing = ({handleNavigation}) => {
    const [selectedValue, setSelectedValue] = useState('');

    const handleChange = (event) => {
        setSelectedValue(event.target.value);
    };


    return (
        <div className='page text-center flex justify-center flex-col items-center gap-4'>
            <h1>Welcome to Pinpoint</h1>
            {/* //!Place holder for description for landing page */}
            <div className='space-x-2'>
            <button className='btn btn-primary' onClick={() => handleNavigation("/Auth")} >Signup</button>
            <button className='btn btn-primary' onClick={() => handleNavigation("/Auth?login=true")} >Login</button>
            </div>
            <label htmlFor="myDropdown">State</label>
            <select id="myDropdown" value={selectedValue} onChange={handleChange}>
                <option value="">-- --</option>
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
                <option value="option3">Option 3</option>
            </select>
            {/* <input text="Zipcode" /> check for this */}
            <div className="card bg-base-100 w-96 shadow-sm">
            <h2 className="card-title">Bills</h2>
            <p>Here's a list of Bills in your area:</p>
                <figure>
                   {/* Add bills info */}
                </figure>
                <div className="card-body">
                    <div className="card-actions justify-end">
                    </div>
                </div>
            </div>
            <div className="card bg-base-100 w-96 shadow-sm">
            <h2 className="card-title">Officials</h2>
            <p>Here's a list of officials in your area:</p>
                <figure>
                   {/* Add bills info */}
                </figure>
                <div className="card-body">
                    <div className="card-actions justify-end">
                    </div>
                </div>
            </div>

        </div>
    )
}

export default Landing