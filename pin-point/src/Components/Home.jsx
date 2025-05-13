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
  const officialsPerPage = 3;

  const [billPage, setBillPage] = useState(1);
  const billsPerPage = 3;

  const mapRef = useRef(null);
  const zipLayerRef = useRef(null);
  const zipFeaturesRef = useRef({});

  const navigate = useNavigate()

  // Fetch user profile
  const fetchUser = async () => {
    try {
      const res = await fetch(`http://localhost:8080/users/one/${uid}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (!res.ok || !data.User) {
        console.error("User not found or invalid token");
        return null;
      }

      setUser(data.User);
      // console.log("User:", data.User)
      return data.User;
    } catch (err) {
      console.error("Fetch user failed:", err);
      return null;
    }
  };

  // Fetch OpenStates data for officials and bills
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
      // ✅ Ensure container is ready
      const container = L.DomUtil.get('map');
      if (!container) {
        console.warn("Map container not ready.");
        return;
      }

      // ✅ Prevent reuse error by clearing Leaflet's internal ID
      if (container._leaflet_id) {
        container._leaflet_id = null;
      }

      const userData = await fetchUser();
      if (!userData) return;

      console.log("User data:", userData);
      console.log("ZIP code:", userData?.zipCode);

      // ✅ Create new map instance safely
      mapRef.current = L.map(container).setView([37.8, -96], 4);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapRef.current);

      const geoData = await fetch('/usa_zip_codes.json').then(res => res.json());
      //console.log("Geo data:", geoData)

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

      const stateCode = getStateFromZip(userData.zipCode);
      console.log("State code from ZIP:", stateCode);

      if (stateCode) await fetchOpenStatesData(stateCode);

      setLoading(false);
    };

    requestAnimationFrame(() => {
      setTimeout(init, 0);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [token, uid]);

  const indexOfLast = currentPage * officialsPerPage;
  const indexOfFirst = indexOfLast - officialsPerPage;
  const currentOfficials = officials.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(officials.length / officialsPerPage);

  const billIndexLast = billPage * billsPerPage;
  const billIndexFirst = billIndexLast - billsPerPage;
  const currentBills = bills.slice(billIndexFirst, billIndexLast);
  const totalBillPages = Math.ceil(bills.length / billsPerPage);

  return (
    <div className='page text-center flex flex-col gap-6'>
      <h1 className='text-3xl font-bold text-primary'>
        {user ? `Welcome Home, ${capitalizeFirst(user.firstName)}!` : "Welcome Home"}
      </h1>

      <div className="flex flex-col md:flex-row gap-4 p-4">
        {/* Officials */}
        <div className="flex-1 overflow-auto border rounded bg-base-300 p-4">
          <h2 className="text-lg font-semibold mb-2">Officials</h2>
          {loading ? (
            <p>Loading...</p>
          ) : currentOfficials.length === 0 ? (
            <p>No officials found.</p>
          ) : (
            <>
              <div className="flex flex-col gap-4">
                {currentOfficials.map((o) => (
                  <div key={o.id} className="p-3 border rounded shadow-sm flex gap-4 items-center">
                    {o.image && (
                      <img
                        src={o.image}
                        alt={`${o.name}`}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="text-left">
                      <h3 className="font-bold">{o.name}</h3>
                      <p>District: {o.current_role?.district || 'N/A'}</p>
                      <p>Party: {o.party || 'N/A'}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              <div className="flex justify-center mt-4 gap-2">
                <button
                  className="btn btn-sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                >
                  Prev
                </button>
                <span className="self-center">Page {currentPage} of {totalPages}</span>
                <button
                  className="btn btn-sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>

        {/* Map */}
        <div className="flex-1 border rounded bg-base-300 p-4">
          <h2 className="text-lg font-semibold mb-2">Your District</h2>
          <div id="map" style={{ height: '50vh', width: '100%' }}></div>
        </div>

        {/* Bills */}
        <div className="flex-1 overflow-auto border rounded bg-base-300 p-4">
          <h2 className="text-lg font-semibold mb-2">Recent Bills</h2>
          {loading ? (
            <p>Loading...</p>
          ) : currentBills.length === 0 ? (
            <p>No bills found.</p>
          ) : (
            <>
              <ul className="list-disc list-inside text-left space-y-2">
                {currentBills.map((bill) => (
                  <li key={bill.id}>
                    <strong>{bill.title}</strong>
                    <br />
                    <span className="text-sm text-gray-600">
                      Passed: {bill.latest_action_date ? new Date(bill.latest_action_date).toLocaleDateString() : "N/A"}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Pagination Controls */}
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
    </div>
  );
};

export default Home;