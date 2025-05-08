import React from 'react'

const Account = () => {

    const handleUpdate = () => {
        // grab a hold of values for state 
        // fetch reaching out to an endpoint (token and validsession) 
    }
    return (
        <div className='page flex flex-col'>

            <div className='py-4 text-center'>Account</div>
            <form className='flex flex-col justify-center items-center gap-4'>
                <input type="text" placeholder="Firstname" className="input input-success" />
                <input type="text" placeholder="Lastname" className="input input-success" />
                <label className="input validator input-success">
                    <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <g
                            strokeLinejoin="round"
                            strokeLinecap="round"
                            strokeWidth="2.5"
                            fill="none"
                            stroke="currentColor"
                        >
                            <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                        </g>
                    </svg>
                    <input type="email" placeholder="mail@site.com" required />
                </label>
                <div className="validator-hint hidden">Enter valid email address</div>
                <input type="date" className="input input-success" />
                <input type="text" placeholder="Zipcode" className="input input-success" />

                <button className="btn btn-success">Submit</button>

            </form>
        </div>

    )
}

export default Account