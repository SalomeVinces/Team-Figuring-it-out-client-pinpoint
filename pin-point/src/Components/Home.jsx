import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getStateFromZip } from '../utils/zipToState.js'
import pin3 from "../assets/Pin3.png"


const Home = ({ token, uid, openStatesCache }) => {
  const [user, setUser] = useState(null);
  const [officials, setOfficials] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const officialsPerPage = 5;

  const [billPage, setBillPage] = useState(1);
  const billsPerPage = 3; // Show 3 bills per page

  const mapRef = useRef(null);
  const zipLayerRef = useRef(null);
  const zipFeaturesRef = useRef({});

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChamber, setSelectedChamber] = useState("");

  const [filteredBills, setFilteredBills] = useState([]);
  const [loadingBills, setLoadingBills] = useState(false);
  const [stateCode, setStateCode] = useState("");

  const [officialParty, setOfficialParty] = useState("");
  const [officialChamber, setOfficialChamber] = useState("");

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

  // Add forceRefresh parameter (default false)
  const fetchOpenStatesData = async (stateCode, forceRefresh = false) => {
    console.log(stateCode)
    if (!forceRefresh && openStatesCache.current[stateCode]) {
      const cached = openStatesCache.current[stateCode];
      console.log("Using cached OpenStates data for state:", stateCode);
      setOfficials(cached.officials);
      setBills(cached.bills);
      return;
    }
    try {
      // Add ?officialsLimit=20&billsLimit=20 to your backend endpoint if supported
      const res = await fetch(`http://localhost:8080/landing/${stateCode}?officialsLimit=20&billsLimit=20`);
      const data = await res.json();
      const officials = Array.isArray(data.officials) ? data.officials : [];
      const bills = Array.isArray(data.bills) ? data.bills : [];
      setOfficials(officials);
      setBills(bills);
      openStatesCache.current[stateCode] = { officials, bills };
      console.log("Cache updated for state:", stateCode, openStatesCache.current[stateCode]);
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
      // Ensure zip codes are always treated as strings with leading zeros
      const userZip = userData.zipCode ? String(userData.zipCode).padStart(5, '0') : '';
      const zipFeature = zipFeaturesRef.current[userZip];
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
        setFilteredBills(openStatesCache.current[code]?.bills || []); // Set filteredBills to initial bills
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
      // If no search term and no chamber selected, reset to initial bills
      if (!searchTerm.trim() && !selectedChamber) {
        setFilteredBills(bills);
        setLoadingBills(false);
        return;
      }
      const searchTerms = searchTerm.split(",").map(t => t.trim()).filter(Boolean);
      let combinedResults = [];
      let jurisdiction = jurisdictionOverride;
      if (jurisdiction && typeof jurisdiction === 'object') {
        jurisdiction = jurisdiction.value || jurisdiction.name || '';
      }
      if (!jurisdiction) {
        // Prevent backend call if jurisdiction is missing
        setFilteredBills([]);
        setLoadingBills(false);
        return;
      }
      for (const term of searchTerms.length ? searchTerms : [""]) {
        const url = new URL("http://localhost:8080/bills");
        url.searchParams.append("jurisdiction", jurisdiction);
        if (term) url.searchParams.append("q", term);
        if (selectedChamber) url.searchParams.append("chamber", selectedChamber);
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

  // Ensure bills are filtered by chamber from cache if no search term is present
  useEffect(() => {
    if (!searchTerm.trim()) {
      let filtered = bills;
      if (selectedChamber) {
        filtered = bills.filter(bill => {
          const classification =
            bill.from_organization?.classification ||
            (bill.from_organization && typeof bill.from_organization === "string" ? bill.from_organization : "");
          return (
            typeof classification === "string" &&
            classification.toLowerCase() === selectedChamber.toLowerCase()
          );
        });
      }
      setFilteredBills(filtered);
    } else {
      // If search term is present, filter locally by bill.title (case-insensitive, partial match)
      let filtered = bills.filter(bill =>
        bill.title && bill.title.toLowerCase().includes(searchTerm.trim().toLowerCase())
      );
      if (selectedChamber) {
        filtered = filtered.filter(bill => {
          const classification =
            bill.from_organization?.classification ||
            (bill.from_organization && typeof bill.from_organization === "string" ? bill.from_organization : "");
          return (
            typeof classification === "string" &&
            classification.toLowerCase() === selectedChamber.toLowerCase()
          );
        });
      }
      setFilteredBills(filtered);
    }
    // eslint-disable-next-line
  }, [selectedChamber, bills, searchTerm]);

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

          {/* Bills */}
          <div className="flex-1 overflow-auto rounded bg-base-300 p-4" style={{ background: "#415E6C" }}>
            <h2 className="text-lg font-semibold mb-2 text-white">Recent Bills</h2>
            <div className="flex flex-wrap gap-3 mb-4 text-left justify-center items-center">
              <input type="text" placeholder="Search term" className="input input-bordered" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

              <select
                className="select select-bordered"
                value={selectedChamber}
                onChange={(e) => setSelectedChamber(e.target.value)}
              >
                <option value="">All Chambers</option>
                <option value="lower">House (Representatives)</option>
                <option value="upper">Senate</option>
              </select>
            </div>

            {loadingBills ? (
              <p>Loading...</p>
            ) : filteredBills.length === 0 ? (
              <p>No bills found.</p>
            ) : (
              <>
                {/* <ul className="list-disc list-inside text-left space-y-2 bg-white p-3 border rounded">
                  {currentBills.map((bill) => (
                    <li key={bill.id}>
                     <div className="bg-white p-3 border rounded shadow " >
                      
 

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
                </ul> */}
                <ul className="list-none list-inside text-left space-y-2 p-3">
                  {currentBills.map((bill) => (
                    <li key={bill.id}>
                      <div className="bg-white p-3 border rounded shadow">
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <img
                            src={pin3}
                            style={{
                              minHeight: "2em",
                              minWidth: "1.5em",
                              maxWidth: "1.5em",
                              maxHeight: "2em",
                              marginRight: "0.75rem"
                            }}
                            alt="pin icon"
                          />
                          <div>
                            <strong>{bill.title}</strong><br />
                            {bill.identifier && (
                              <span className="ml-2 text-xs text-gray-600">Bill ID: {bill.identifier} </span> 
                            )}
                            <a
                              href={bill.openstates_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline text-sm"
                            >
                              View Details
                            </a>
                            
                          </div>
                        </div>
                      </div>
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

        {/* Officials */}
        <div className="flex flex-col md:flex-row gap-4 px-4">
          <div className="flex-1 overflow-auto border rounded bg-base-300  basis-55" style={{ background: "#415E6C" }}>
            <h2 className="text-lg font-semibold mb-2 text-white " >Officials</h2>
            <div className="flex flex-wrap gap-3 mb-4 text-left mx-2 ">
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
                <div className="flex flex-col gap-4 px-4">
                  {currentOfficials.map((o) => (
                    <div key={o.id} className="p-3 border rounded shadow-sm flex gap-4 items-center bg-white">
                      {o.image && <img src={o.image} alt={o.name} className="w-16 h-16 object-cover rounded" />}
                      <div className="text-left">
                        <h3 className="font-bold">{o.name}</h3>
                        <p>District: {o.current_role?.district || 'N/A'}</p>
                        <p>Party: {o.party || 'N/A'}</p>
                        {o.email && (
                          <p>
                            <a
                              style={{ fontSize: o.email.length > 25 ? ".6em" : undefined }}
                              href={`mailto:${o.email}`}
                              className="text-blue-600 underline"
                            >
                              {o.email}
                            </a>
                          </p>
                        )}
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
