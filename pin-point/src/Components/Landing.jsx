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
        <div className='page text-center flex justify-center flex-col items-center gap-5 m-3 min-h-screenrounded '>
        {/* // <div className='page text-center flex justify-center flex-col items-center gap-3 m-1'> */}
            {/* //!Place holder for wide PinPoint Image for landing page */}
            {/* //!Place holder for description for landing page */}
            {/* <h1>Welcome to Pinpoint</h1> */}

            {/* text */}
  
<div className="card bg-base-500  w-full h-[300px] ">

  <figure>
    <img
      src="https://media.istockphoto.com/id/1367415304/photo/the-united-states-capitol-often-called-the-capitol-building-is-the-home-of-the-united-states.jpg?s=1024x1024&w=is&k=20&c=1wBEJdevqK9-OOcIYfOnZYjxcacCuPK2W_-6AgjVgtY="
      alt=""
      className="w-full h-full "
    />
  </figure>

  {/* Texte centré sur l'image */}
  <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-3">
    <h1 className="text-5xl font-bold"> Pinpoint</h1>
    <p className="text-center leading-relaxed  font-medium max-w-3xl mx-auto rounded text-3xl font-bold">
     Pinpoint makes your work easier.
 Find the information you need, organize your tasks, and gain clarity.
 Everything becomes faster, simpler, and more efficient.
  </p>
  </div>
</div>


{/*   */}
            <div className='space-x-2'>
                <button className='btn btn-accent' onClick={() => handleNavigation("/Auth")} >Signup</button>
                <button className='btn btn-accent' onClick={() => handleNavigation("/Auth?login=true")} >Login</button>
            </div>

            <select className="select select-bordered w-64 bg-" value={selectedValue} onChange={handleChange}>
                <option value="">-- Select a State --</option>
                {states.map((s) => (
                    <option key={s.value} value={s.value}>
                        {s.name}
                    </option>
                ))}
            </select>

            <div className="flex flex-col md:flex-row justify-center gap-6 mt-4 w-full max-w-7xl ">
                
            {/* Bills Section */}
                <div className="flex-1 bg-base-100 shadow-md p-4 border rounded bg-secondary ">
                    <h2 className="text-lg font-semibold mb-2 ">Bills</h2>
                    {loading ? <p>Loading...</p> :
                        bills.map((bill) => (
                            <div key={bill.id} className="border p-3 my-2 rounded shadow-sm text-left bg-white">
                                <h3 className="font-bold text-lg">{bill.title}</h3>
                                <p className="text-sm text-gray-700 ">Bill ID: {bill.identifier}</p>
                                <p className="text-sm text-gray-700">
                                    Latest Action Date: {bill.latest_action_date ? new Date(bill.latest_action_date).toLocaleDateString() : "N/A"}
                                </p>
                            </div>
                        ))
                    }
                </div>

            {/* Officials Section */}
                <div className="flex-1 bg-base-100 shadow-md p-4 border rounded bg-secondary ">
                    <h2 className="text-lg font-semibold mb-2 ">Officials</h2>
                    {loading ? <p>Loading...</p> :
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                            {sortedOfficials.map((o) => (
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