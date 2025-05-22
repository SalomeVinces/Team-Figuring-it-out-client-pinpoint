import React, { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from "react-router-dom"
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getStateFromZip } from '../utils/zipToState.js'

const Home = ({ token, uid }) => {
  const [user, setUser] = useState(null);
  const [officials, setOfficials] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const officialsPerPage = 5;

  const [billPage, setBillPage] = useState(1);
  const billsPerPage = 5;

  const mapRef = useRef(null);
  const zipLayerRef = useRef(null);
  const zipFeaturesRef = useRef({});

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChamber, setSelectedChamber] = useState("");


  const [filteredBills, setFilteredBills] = useState([]);
  const [loadingBills, setLoadingBills] = useState(false);
  const MAX_DISPLAYED_BILLS = 5;
  const [stateCode, setStateCode] = useState("");

  const [officialParty, setOfficialParty] = useState("");
  const [officialChamber, setOfficialChamber] = useState("");

  const navigate = useNavigate();

  const fetchUser = async () => {
    try {
      const res = await fetch(`http://localhost:8080/users/one/${uid}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.User) return null;
      setUser(data.User);
      return data.User;
    } catch (err) {
      console.error("Fetch user failed:", err);
      return null;
    }
  };

  const fetchOpenStatesData = async (stateCode) => {
    try {
      const res = await fetch(`http://localhost:8080/landing/${stateCode}`);
      const data = await res.json();
      setOfficials(data.officials || []);
      setBills(data.bills || []);
    } catch (err) {
      console.error("Error fetching OpenStates data:", err);
    }
  };

  const capitalizeFirst = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

  useEffect(() => {
    if (!token || !uid) return;
    const init = async () => {
      const container = L.DomUtil.get('map');
      if (!container) return;
      if (mapRef.current) {
        mapRef.current.off();
        mapRef.current.remove();
      }
      const userData = await fetchUser();
      if (!userData) return;
      mapRef.current = L.map(container).setView([37.8, -96], 4);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapRef.current);
      const geoData = await fetch('/usa_zip_codes.json').then(res => res.json());
      zipLayerRef.current = L.geoJSON(geoData, {
        style: { color: '#3388ff', weight: 1, fillOpacity: 0.1 },
        onEachFeature: (feature, layer) => {
          const zip = feature.properties.ZCTA5CE10;
          zipFeaturesRef.current[zip] = { feature, layer };
          layer.bindPopup(`ZIP Code: ${zip}`);
        }
      }).addTo(mapRef.current);
      const zipFeature = zipFeaturesRef.current[userData.zipCode];
      if (zipFeature) {
        const { layer } = zipFeature;
        mapRef.current.fitBounds(layer.getBounds());
        zipLayerRef.current.eachLayer(l => zipLayerRef.current.resetStyle(l));
        layer.setStyle({ color: 'red', weight: 3, fillOpacity: 0.3 });
        layer.openPopup();
      }
      const code = getStateFromZip(userData.zipCode);
      setStateCode(code);
      if (code) {
        await fetchOpenStatesData(code);
        await handleSearch(code);
      }
      setLoading(false);
    };
    requestAnimationFrame(() => setTimeout(init, 0));
    return () => {
      if (mapRef.current) {
        mapRef.current.off();
        mapRef.current.remove();
      }
    };
  }, [token, uid]);

  const handleSearch = async (jurisdictionOverride = stateCode) => {
    setBillPage(1);
    setLoadingBills(true);
    try {
      const searchTerms = searchTerm.split(",").map(t => t.trim()).filter(Boolean);
      let combinedResults = [];
      for (const term of searchTerms.length ? searchTerms : [""]) {
        const url = new URL("http://localhost:8080/bills");
        if (jurisdictionOverride) url.searchParams.append("jurisdiction", jurisdictionOverride);
        if (term) url.searchParams.append("q", term);
        if (selectedChamber) {
          console.log("Selected Chamber (frontend):", selectedChamber);
          url.searchParams.append("chamber", selectedChamber);
        }


        const res = await fetch(url.toString());
        const data = await res.json();
        combinedResults.push(...(data.results || []));
      }
      const uniqueResults = Array.from(new Map(combinedResults.map(b => [b.id, b])).values());
      setFilteredBills(uniqueResults);
    } catch (err) {
      console.error("Error fetching filtered bills:", err);
    } finally {
      setLoadingBills(false);
    }
  };

  const filteredOfficials = officials.filter(o => {
    const partyMatch = !officialParty || o.party === officialParty;
    const chamberMatch = !officialChamber || (
      o.current_role?.title?.toLowerCase().includes(officialChamber.toLowerCase())
    );
    return partyMatch && chamberMatch;
  });

  const indexOfLast = currentPage * officialsPerPage;
  const indexOfFirst = indexOfLast - officialsPerPage;
  const currentOfficials = filteredOfficials.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredOfficials.length / officialsPerPage);

  const billIndexLast = billPage * billsPerPage;
  const billIndexFirst = billIndexLast - billsPerPage;
  const currentBills = filteredBills.slice(billIndexFirst, billIndexLast);
  const totalBillPages = Math.ceil(filteredBills.length / billsPerPage);

  return (
    <div className='page text-center flex flex-col gap-6 pb-4' style={{ background: "#5F717A" }}>
      <h1 className='text-3xl font-bold text-white py-4 pb-0'>
        {user ? `Welcome Home, ${capitalizeFirst(user.firstName)}!` : "Welcome Home"}
      </h1>
      {/* Map */}
      <div className='flex flex-row px-4'>
        <div className="flex-3 border-1 rounded bg-base-300" style={{ background: "#415E6C" }} >
          <h2 className="text-lg font-semibold mb-2 text-white">Your District</h2>
          <div id="map" style={{ height: '50vh', width: '100%' }}></div>
          <div className="flex-1 overflow-auto rounded bg-base-300 p-4" style={{ background: "#415E6C" }}>
            <h2 className="text-lg font-semibold mb-2 text-white">Recent Bills</h2>
            <div className="flex flex-wrap gap-3 mb-4 text-left">
              <input type="text" placeholder="Search term" className="input input-bordered" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

              <select
                className="select select-bordered"
                value={selectedChamber}
                onChange={(e) => setSelectedChamber(e.target.value)}
              >
                <option value="">All Chambers</option>
                <option value="House">House</option>
                <option value="Senate">Senate</option>
              </select>

              <button className="btn btn-accent" onClick={handleSearch}>Search</button>
            </div>

            {loadingBills ? (
              <p>Loading...</p>
            ) : filteredBills.length === 0 ? (
              <p>No bills found.</p>
            ) : (
              <>
                <ul className="list-disc list-inside text-left space-y-2 bg-white p-3 border rounded">
                  {currentBills.map((bill) => (
                    <li key={bill.id}>
                      <strong>{bill.title}</strong><br />
                      <a
                        href={bill.openstates_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline text-sm"
                      >
                        View Details
                      </a>
                    </li>
                  ))}
                </ul>

                <div className="flex justify-center mt-4 gap-2">
                  <button
                    className="btn btn-sm"
                    disabled={billPage === 1}
                    onClick={() => setBillPage(prev => prev - 1)}
                  >
                    Prev
                  </button>
                  <span className="self-center">Page {billPage} of {totalBillPages}</span>
                  <button
                    className="btn btn-sm"
                    disabled={billPage === totalBillPages}
                    onClick={() => setBillPage(prev => prev + 1)}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4 px-4">
          <div className="flex-1 overflow-auto border rounded bg-base-300  basis-55" style={{ background: "#415E6C" }}>
            <h2 className="text-lg font-semibold mb-2 text-white " >Officials</h2>
            <div className="flex flex-wrap gap-3 mb-4 text-left mx-2">
              <select className="select select-bordered" value={officialParty} onChange={(e) => setOfficialParty(e.target.value)}>
                <option value="">All Parties</option>
                <option value="Democratic">Democratic</option>
                <option value="Republican">Republican</option>
              </select>

              <select className="select select-bordered" value={officialChamber} onChange={(e) => setOfficialChamber(e.target.value)}>
                <option value="">All Chambers</option>
                <option value="Representative">House</option>
                <option value="Senator">Senate</option>
              </select>
            </div>
            {loading ? <p>Loading...</p> : currentOfficials.length === 0 ? (
              <p>No officials found.</p>
            ) : (
              <>
                <div className="flex flex-col gap-4">
                  {currentOfficials.map((o) => (
                    <div key={o.id} className="p-3 border rounded shadow-sm flex gap-4 items-center bg-white">
                      {o.image && <img src={o.image} alt={o.name} className="w-16 h-16 object-cover rounded" />}
                      <div className="text-left">
                        <h3 className="font-bold">{o.name}</h3>
                        <p>District: {o.current_role?.district || 'N/A'}</p>
                        <p>Party: {o.party || 'N/A'}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center mt-4 gap-2">
                  <button className="btn btn-sm" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>Prev</button>
                  <span className="self-center">Page {currentPage} of {totalPages}</span>
                  <button className="btn btn-sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>Next</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
