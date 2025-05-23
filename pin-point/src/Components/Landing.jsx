import React, { useState, useRef } from 'react'
import { states } from '../utils/states.js'
import landingBg from "../assets/LandingBg2.jpg"
import pin3 from "../assets/Pin3.png"

const Landing = ({ handleNavigation }) => {
    const [selectedValue, setSelectedValue] = useState('');
    const [bills, setBills] = useState([]);
    const [officials, setOfficials] = useState([]);
    const [loading, setLoading] = useState(false);
    const landingCache = useRef({});

    const handleChange = (event) => {
        const selected = event.target.value;
        setSelectedValue(selected);
        fetchLandingData(selected);
    };

    const fetchLandingData = async (stateCode) => {
        if (landingCache.current[stateCode]) {
            const cached = landingCache.current[stateCode];
            setBills(cached.bills);
            setOfficials(cached.officials);
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8080/landing/${stateCode}`);
            const data = await res.json();
            // Only keep top 10 bills and officials
            const bills = Array.isArray(data.bills) ? data.bills.slice(0, 10) : [];
            const officials = Array.isArray(data.officials) ? data.officials.slice(0, 10) : [];
            setBills(bills);
            setOfficials(officials);
            landingCache.current[stateCode] = { bills, officials };
        } catch (err) {
            console.error('Fetch error:', err);
            setBills([]);
            setOfficials([]);
        } finally {
            setLoading(false);
        }
    };

    const sortedOfficials = [...officials].sort((a, b) => {
        const aDistrict = parseInt(a.current_role?.district || 0);
        const bDistrict = parseInt(b.current_role?.district || 0);
        return aDistrict - bDistrict;
    });

    return (
        <div className='page text-center flex justify-center flex-col items-center gap-5 pb-4 min-h-screenrounded' style={{background:"#5F717A"}}>
            {/* // <div className='page text-center flex justify-center flex-col items-center gap-3 m-1'> */}
            {/* //!Place holder for wide PinPoint Image for landing page */}
            {/* //!Place holder for description for landing page */}
            {/* <h1>Welcome to Pinpoint</h1> */}

            {/* text */}

            <div className="card bg-base-500   ">

                <div>
                    <div className='space-x-2 absolute bottom-3 right-8 z-10'>
                        <button className='btn btn-accent' onClick={() => {
                            console.log("signup was clicked");
                            handleNavigation("/Auth")
                            }} >Signup</button>
                        <button className='btn btn-accent' onClick={() => handleNavigation("/Auth?login=true")} >Login</button>
                    </div>
                    <img
                        src={landingBg}
                        className=" "
                        style={{height:"80vh",  width:"100vw", objectFit:"cover"}}
                    />
                </div>

                {/* Center image */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white text-shadow-sm px-3">
                    <h1 className="text-7xl font-bold text-shadow-lg/20 mb-5 tagesschrift-regular"> Pinpoint</h1>
                    <div style={{background:"rgba(0,0,0,.6)"}}>
                    <p className="text-center leading-relaxed font-medium max-w-3xl mx-auto rounded text-xl text-shadow-lg/20 p-8  ">
                        Pinpoint makes your work easier. Find the information you need, organize your tasks, and gain clarity.
                        Everything becomes faster, simpler, and more efficient.
                    </p>
                    </div>
                </div>
            </div>

            <select className="select select-bordered w-64 bg-" value={selectedValue} onChange={handleChange}>
                <option value="">-- Select a State --</option>
                {states.map((s) => (
                    <option key={s.value} value={s.value}>
                        {s.name}
                    </option>
                ))}
            </select>

            {selectedValue && (
                <div className="flex flex-col md:flex-row justify-center gap-6 mt-4 w-full max-w-7xl ">

                    {/* Bills Section */}
                    <div className="flex-1 shadow-md p-4 border rounded " style={{background:"#415E6C"}}>
                        <h2 className="text-lg font-semibold mb-2 text-white">Bills</h2>
                        {loading ? <p>Loading...</p> :
                            bills.slice(0, 3).map((bill) => (
                                <div key={bill.id} className="border p-3 my-2 rounded shadow-sm text-left bg-white">
                                    <div className='flex '>
                                     <img src={pin3} style={{minHeight:"2em", minWidth:"1.5em", maxWidth:"1.5em", maxHeight:"2em"}}/>   
                                    <h3 className="font-semibold text-md">{bill.title}</h3>
                                    </div>
                                    <p className="text-sm text-gray-700 ">Bill ID: {bill.identifier}</p>
                                    <p className="text-sm text-gray-700">
                                        Latest Action Date: {bill.latest_action_date ? new Date(bill.latest_action_date).toLocaleDateString() : "N/A"}
                                    </p>
                                </div>
                            ))
                        }
                        {bills.length > 3 && (
                            <div className="mt-2 text-center">
                                <button className="btn btn-accent" onClick={() => handleNavigation("/Auth")}>Sign up to see more bills</button>
                            </div>
                        )}
                    </div>

                    {/* Officials Section */}
                    <div className="flex-1  shadow-md p-4 border rounded"style={{background:"#415E6C"}} >
                        <h2 className="text-lg font-semibold mb-2 text-white">Officials</h2>
                        {loading ? <p>Loading...</p> :
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                                {sortedOfficials.slice(0, 6).map((o) => (
                                    <div key={o.id} className="border p-3 rounded shadow-sm text-left flex gap-4 items-start bg-white ">
                                        {o.image && (
                                            <img
                                                src={o.image}
                                                alt={`${o.name} portrait`}
                                                className="w-16 h-16 object-cover rounded "
                                            />
                                        )}
                                        <div>
                                            <h3 className="font-bold ">{o.name}</h3>
                                            <p>{o.current_role?.title} - District {o.current_role?.district || "N/A"}</p>
                                            <p>Party: {o.party || 'N/A'}</p>
                                            {o.email && (
                                                <p>
                                                    <a style={{fontSize: o.email.length > 25 ? ".6em" : null }}   href={`mailto:${o.email}`} className={`text-blue-600 underline`}>
                                                        {o.email}
                                                    </a>
                                                </p>
                                            )}
                                            {o.links?.[0]?.url && (
                                                <p>
                                                    <a
                                                        href={o.links[0].url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-blue-600 underline"
                                                    >
                                                        Website
                                                    </a>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        }
                        {sortedOfficials.length > 6 && (
                            <div className="mt-2 text-center">
                                <button className="btn btn-accent" onClick={() => handleNavigation("/Auth")}>Sign up to see more officials</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
    )
}

export default Landing