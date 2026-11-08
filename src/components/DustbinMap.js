import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';

const DustbinMap = () => {
  const [dustbins, setDustbins] = useState([]);

  useEffect(() => {
    const fetchBins = async () => {
      try {
        const res = await axios.get('https://smart-dustbin-backend-rzjf.onrender.com/api/dustbins');
        setDustbins(res.data);
      } catch (error) {
        console.error("Error fetching dustbins", error);
      }
    };
    fetchBins();
    const interval = setInterval(fetchBins, 10000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ height: "100vh" }}>
      <MapContainer center={[22.5726, 88.3639]} zoom={12} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {dustbins.map((bin) => (
          <Marker key={bin.binId} position={[bin.location.lat, bin.location.lng]}>
            <Popup>
              <b>{bin.binId}</b><br/>{bin.address}<br/>Fill Level: {bin.fillLevel}%<br/>Status: {bin.status}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default DustbinMap;