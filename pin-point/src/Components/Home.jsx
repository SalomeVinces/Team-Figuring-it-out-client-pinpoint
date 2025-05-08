import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const Home = () => {
  const mapRef = useRef(null); // reference for Leaflet map object
  const zipInputRef = useRef(null); // reference for input field
  const zipLayerRef = useRef(null); // reference for GeoJSON layer
  const zipFeaturesRef = useRef({}); // reference for zip feature lookup object

  useEffect(() => {
    // initialize the map
    mapRef.current = L.map('map').setView([37.8, -96], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapRef.current);

    // load GeoJSON from file in public folder so it is not calling out to the internet
    fetch('/usa_zip_codes.json') 
    //no longer this fetch('https://raw.githubusercontent.com/ndrezn/zip-code-geojson/master/usa_zip_codes_geo_15m.json')
      .then(res => res.json())
      .then(data => {
        zipLayerRef.current = L.geoJSON(data, {
          style: { color: '#3388ff', weight: 1, fillOpacity: 0.1 },
          onEachFeature: (feature, layer) => {
            const zip = feature.properties.ZCTA5CE10;
            zipFeaturesRef.current[zip] = { feature, layer };
            layer.bindPopup(`ZIP Code: ${zip}`);
          }
        }).addTo(mapRef.current);
      });

    return () => {
      mapRef.current.remove();
    };
  }, []);

  const searchZip = () => {
    const zip = zipInputRef.current.value.trim();
    const zipFeature = zipFeaturesRef.current[zip];

    if (zipFeature) {
      const { layer } = zipFeature;
      mapRef.current.fitBounds(layer.getBounds());
      layer.openPopup();
      highlightZip(layer);
    } else {
      alert('ZIP code not found.');
    }
  };

  const highlightZip = (layer) => {
    if (!zipLayerRef.current) return;
    zipLayerRef.current.eachLayer(l => zipLayerRef.current.resetStyle(l));
    layer.setStyle({ color: 'red', weight: 3, fillOpacity: 0.3 });
  };


  return (
    <div className='page'>
      <h1 className='text-3xl font-bold text-primary'>Welcome Home User!</h1>

      <div className="flex flex-col md:flex-row gap-4 p-4">

        {/* Adding officials and bills  */}
        <div className="flex-1 flex items-stretch">
          <div className="stats bg-base-300 border border-solid border-accent flex-1">
            <div className="stat">
              <div className="stat-title">House/Senate Officials</div>
              <div className="stat-value">by zipcode</div>
              <div className="stat-actions">
                {/* <button className="btn btn-xs btn-success"></button> */}
              </div>
            </div>
          </div>
        </div>

        {/* Importing interactive map to search by user input zipcode */}
        <div className="flex-[1] flex flex-col items-stretch stats bg-base-300 border border-solid border-accent p-4">
          <div id="searchBar" className="p-2 flex justify-center">
            <input
              ref={zipInputRef}
              type="text"
              placeholder="Enter ZIP Code (e.g. 30080)"
              className="stats border bg-base-100 px-2 py-1 mr-2" />

            <button onClick={searchZip} className="btn btn-primary btn-sm">
              Search
            </button>
          </div>
          
          <div className='stats' id="map" style={{ height: '50vh', width: '100%' }}></div>
        </div>

        {/* Using to display data about recently passed Bills */}
        <div className="flex-1 flex items-stretch">
          <div className="stats bg-base-300 border border-solid border-accent flex-1">
            <div className="stat">
              <div className="stat-title">Bills</div>
              <div className="stat-value">Recently passed</div>
              <div className="stat-actions">
                {/* <button className="btn btn-xs btn-success"></button> */}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}

export default Home