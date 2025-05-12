import React, { useState } from 'react'
import { states } from '../utils/states.js'

const Landing = ({ handleNavigation }) => {
    const [selectedValue, setSelectedValue] = useState('');
    const [bills, setBills] = useState([]);
    const [officials, setOfficials] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        const selected = event.target.value;
        setSelectedValue(selected);
        fetchLandingData(selected);
    };

    const fetchLandingData = async (stateCode) => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8080/landing/${stateCode}`);
            const data = await res.json();
            setBills(data.bills);
            setOfficials(data.officials);
        } catch (err) {
            console.error('Fetch error:', err);
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
        <div className='page text-center flex justify-center flex-col items-center gap-4'>
            <h1>Welcome to Pinpoint</h1>
            {/* //!Place holder for description for landing page */}

            <div className='space-x-2'>
                <button className='btn btn-primary' onClick={() => handleNavigation("/Auth")} >Signup</button>
                <button className='btn btn-primary' onClick={() => handleNavigation("/Auth?login=true")} >Login</button>
            </div>

            <select className="select select-bordered w-64" value={selectedValue} onChange={handleChange}>
                <option value="">-- Select a State --</option>
                {states.map((s) => (
                    <option key={s.value} value={s.value}>
                        {s.name}
                    </option>
                ))}
            </select>

            <div className="flex flex-col md:flex-row justify-center gap-6 mt-4 w-full max-w-7xl">
                
            {/* Bills Section */}
                <div className="flex-1 bg-base-100 shadow-md p-4 border rounded">
                    <h2 className="text-lg font-semibold mb-2">Bills</h2>
                    {loading ? <p>Loading...</p> :
                        bills.map((bill) => (
                            <div key={bill.id} className="border p-3 my-2 rounded shadow-sm text-left">
                                <h3 className="font-bold text-lg">{bill.title}</h3>
                                <p className="text-sm text-gray-700">Bill ID: {bill.identifier}</p>
                                <p className="text-sm text-gray-700">
                                    Latest Action Date: {bill.latest_action_date ? new Date(bill.latest_action_date).toLocaleDateString() : "N/A"}
                                </p>
                            </div>
                        ))
                    }
                </div>

            {/* Officials Section */}
                <div className="flex-1 bg-base-100 shadow-md p-4 border rounded">
                    <h2 className="text-lg font-semibold mb-2">Officials</h2>
                    {loading ? <p>Loading...</p> :
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {sortedOfficials.map((o) => (
                                <div key={o.id} className="border p-3 rounded shadow-sm text-left flex gap-4 items-start">
                                    {o.image && (
                                        <img
                                            src={o.image}
                                            alt={`${o.name} portrait`}
                                            className="w-16 h-16 object-cover rounded"
                                        />
                                    )}
                                    <div>
                                        <h3 className="font-bold">{o.name}</h3>
                                        <p>{o.current_role?.title} - District {o.current_role?.district || "N/A"}</p>
                                        <p>Party: {o.party || 'N/A'}</p>
                                        {o.email && (
                                            <p>
                                                <a href={`mailto:${o.email}`} className="text-blue-600 underline">
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
                </div>
            </div>

        </div>
    )
}

export default Landing