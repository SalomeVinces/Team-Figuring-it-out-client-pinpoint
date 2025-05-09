import React from 'react'

const Survey = () => {

    return (
        <div className='page'>
            <h2 className='text-center p-6'> Stay Informed on the Issues You Care About</h2>
            <form className='flex flex-col justify-center items-center gap-3 p-10'>
                <select className="select validator" required>
                    <option disabled selected value="">Preferred Legislative Chamber - “Which legislative chamber are you most interested in?”</option>
                    <option>Senate</option>
                    <option>House of Representives</option>
                    <option>Both</option>
                    <option>No preference</option>
                </select>
                <select className="select validator" required>
                    <option disabled selected value="">Policy Topics - “Which policy areas are most important to you? (Select all that apply)”</option>
                    <option>Education</option>
                    <option>Health care</option>
                    <option>Criminal Justice</option>
                    <option>Environment</option>
                    <option>Housing</option>
                    <option>Labor and Employment</option>
                    <option>Taxation</option>
                    <option>Technology</option>
                </select>
                <select className="select validator" required>
                    <option disabled selected value="">Interest in Bill Types - “What kinds of legislative activities are you interested in following?”</option>
                    <option>Newly introduced bills</option>
                    <option>Bills in committee</option>
                    <option>Bill  up for a vote</option>
                    <option>Bills passed into law</option>
                    <option>Veto bills</option>
                </select>
                <p className="validator-hint">Required</p>
                <button className="btn" type="submit">Submit form</button>
            </form>
        </div>

    )
}

export default Survey