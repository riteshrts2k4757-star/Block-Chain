import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation2, CheckCircle, AlertTriangle, XCircle, Search, Clock, Database, Globe } from 'lucide-react';
import L from 'leaflet';
import { useTelemetry } from '../../context/TelemetryContext';

// Fix Leaflet's default icon path issues in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Map Updater Component to smoothly pan when coords change
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center.lat !== null && center.lng !== null) {
      map.flyTo([center.lat, center.lng], 13, {
        animate: true,
        duration: 1.5
      });
    }
  }, [center, map]);
  return null;
}

export default function LoadTracking() {
  const { latestTelemetry } = useTelemetry();
  
  const [source, setSource] = useState('Manual'); // 'Manual' or 'Live GPS'
  
  const [useLat, setUseLat] = useState(true);
  const [useLng, setUseLng] = useState(true);
  
  const [inputLat, setInputLat] = useState('23.7957');
  const [inputLng, setInputLng] = useState('86.4304');
  
  const [errorLat, setErrorLat] = useState('');
  const [errorLng, setErrorLng] = useState('');
  const [generalError, setGeneralError] = useState('');
  
  const [activeLocation, setActiveLocation] = useState({ lat: 23.7957, lng: 86.4304 });
  const [address, setAddress] = useState('Dhanbad, Jharkhand, India');
  const [addressLoading, setAddressLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());
  
  const testLocations = [
    { name: 'Dhanbad', lat: 23.7957, lng: 86.4304 },
    { name: 'Ranchi', lat: 23.3441, lng: 85.3096 },
    { name: 'Jamshedpur', lat: 22.8046, lng: 86.2029 },
    { name: 'Bokaro', lat: 23.6693, lng: 86.1511 },
    { name: 'Deoghar', lat: 24.4855, lng: 86.6947 }
  ];

  const handleTestLocationChange = (e) => {
    const loc = testLocations.find(l => l.name === e.target.value);
    if (loc) {
      setInputLat(loc.lat.toString());
      setInputLng(loc.lng.toString());
      setErrorLat('');
      setErrorLng('');
      setGeneralError('');
    }
  };

  const fetchAddress = async (lat, lng) => {
    setAddressLoading(true);
    setAddress('');
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
        headers: {
          'Accept-Language': 'en'
        }
      });
      const data = await response.json();
      if (data && data.display_name) {
        const parts = [];
        if (data.address.city || data.address.town || data.address.village) {
            parts.push(data.address.city || data.address.town || data.address.village);
        }
        if (data.address.state) parts.push(data.address.state);
        if (data.address.country) parts.push(data.address.country);
        
        if (parts.length > 0) {
            setAddress(parts.join(', '));
        } else {
            setAddress(data.display_name);
        }
      } else {
        setAddress('Address unavailable');
      }
    } catch (err) {
      console.error('Reverse geocoding error:', err);
      setAddress('Address unavailable');
    }
    setAddressLoading(false);
  };

  const handleShowLocation = () => {
    setGeneralError('');
    setErrorLat('');
    setErrorLng('');

    if (source === 'Manual') {
      if (!useLat || !useLng) {
        setGeneralError('Please enable both latitude and longitude to display the load location.');
        return;
      }
      
      const lat = parseFloat(inputLat);
      const lng = parseFloat(inputLng);
      
      let hasError = false;
      if (isNaN(lat) || lat < -90 || lat > 90) {
        setErrorLat('Please enter a valid latitude between -90 and 90.');
        hasError = true;
      }
      if (isNaN(lng) || lng < -180 || lng > 180) {
        setErrorLng('Please enter a valid longitude between -180 and 180.');
        hasError = true;
      }
      
      if (hasError) return;
      
      setActiveLocation({ lat, lng });
      setLastUpdated(new Date().toLocaleTimeString());
      fetchAddress(lat, lng);
    }
  };

  useEffect(() => {
    if (source === 'Live GPS') {
      if (latestTelemetry?.gps?.lat && latestTelemetry?.gps?.lng) {
          const lat = latestTelemetry.gps.lat;
          const lng = latestTelemetry.gps.lng;
          
          if (activeLocation?.lat !== lat || activeLocation?.lng !== lng) {
            setActiveLocation({ lat, lng });
            setLastUpdated(new Date().toLocaleTimeString());
            fetchAddress(lat, lng);
          }
      }
    }
  }, [source, latestTelemetry, activeLocation]);

  const getStatus = () => {
    if (generalError || errorLat || errorLng) return { text: 'Invalid coordinates', icon: <AlertTriangle size={16} />, color: 'var(--warning)' };
    if (source === 'Live GPS' && (!latestTelemetry || !latestTelemetry.gps)) return { text: 'GPS offline', icon: <XCircle size={16} />, color: 'var(--danger)' };
    if (!useLat || !useLng) return { text: 'Waiting for coordinates', icon: <Clock size={16} />, color: 'var(--text-secondary)' };
    return { text: 'Location available', icon: <CheckCircle size={16} />, color: 'var(--success)' };
  };

  const status = getStatus();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Load Tracking</h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Track the current location of the transported load.</p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start' }}>
        
        {/* Left Column - Controls */}
        <div style={{ flex: '1 1 300px', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Navigation2 size={18} /> Location Controls
            </h3>
            
            <div style={{ marginBottom: '16px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Location Source:</div>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem' }}>
                <input 
                  type="radio" 
                  name="source" 
                  checked={source === 'Manual'} 
                  onChange={() => setSource('Manual')} 
                />
                Manual
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem' }}>
                <input 
                  type="radio" 
                  name="source" 
                  checked={source === 'Live GPS'} 
                  onChange={() => setSource('Live GPS')} 
                />
                Live GPS
              </label>
            </div>

            {source === 'Manual' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, marginBottom: '8px', fontSize: '0.875rem' }}>
                    <input type="checkbox" checked={useLat} onChange={(e) => setUseLat(e.target.checked)} />
                    Use Latitude
                  </label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={inputLat}
                    onChange={(e) => setInputLat(e.target.value)}
                    disabled={!useLat}
                    style={{ width: '100%' }}
                    placeholder="e.g. 23.7957"
                  />
                  {errorLat && <div style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '4px' }}>{errorLat}</div>}
                </div>
                
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, marginBottom: '8px', fontSize: '0.875rem' }}>
                    <input type="checkbox" checked={useLng} onChange={(e) => setUseLng(e.target.checked)} />
                    Use Longitude
                  </label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={inputLng}
                    onChange={(e) => setInputLng(e.target.value)}
                    disabled={!useLng}
                    style={{ width: '100%' }}
                    placeholder="e.g. 86.4304"
                  />
                  {errorLng && <div style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '4px' }}>{errorLng}</div>}
                </div>

                <button 
                  className="btn btn-primary" 
                  onClick={handleShowLocation}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' }}
                >
                  <Search size={18} /> Show Location
                </button>
                
                {generalError && (
                  <div style={{ padding: '12px', background: 'var(--warning-bg)', color: 'var(--warning)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
                    {generalError}
                  </div>
                )}

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '8px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Development Test Locations
                  </label>
                  <select className="form-input" onChange={handleTestLocationChange} defaultValue="Dhanbad" style={{ width: '100%' }}>
                    <option value="" disabled>Select a test location...</option>
                    {testLocations.map(loc => (
                      <option key={loc.name} value={loc.name}>{loc.name} {loc.name === 'Dhanbad' ? '(Demo)' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {source === 'Live GPS' && (
              <div style={{ padding: '24px', textAlign: 'center', background: 'var(--bg-hover)', borderRadius: 'var(--radius-md)' }}>
                {latestTelemetry && latestTelemetry.gps ? (
                  <div style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 500 }}>
                    <CheckCircle size={18} /> GPS Connected
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <Database size={24} />
                    <span style={{ fontSize: '0.875rem' }}>Waiting for GPS hardware telemetry...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Map & Details */}
        <div style={{ flex: '2 1 500px', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="card" style={{ padding: '20px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={18} color="var(--primary)" /> Current Location
                  </h3>
                  <div style={{ fontSize: '1.125rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {addressLoading ? 'Finding location...' : address}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', fontWeight: 600, color: status.color, background: 'var(--bg-hover)', padding: '6px 12px', borderRadius: '20px' }}>
                  {status.icon}
                  {status.text}
                </div>
             </div>
             
             <div style={{ display: 'flex', gap: '24px', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                <div><strong>Latitude:</strong> {activeLocation ? activeLocation.lat : '--'}</div>
                <div><strong>Longitude:</strong> {activeLocation ? activeLocation.lng : '--'}</div>
             </div>

             <div style={{ height: '450px', width: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)', background: '#f8f9fa' }}>
                {activeLocation && activeLocation.lat !== null && activeLocation.lng !== null ? (
                  <MapContainer 
                    center={[activeLocation.lat, activeLocation.lng]} 
                    zoom={13} 
                    style={{ height: '100%', width: '100%' }} 
                    zoomControl={true}
                    scrollWheelZoom={true}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      className="map-tiles"
                    />
                    <Marker position={[activeLocation.lat, activeLocation.lng]}>
                      <Popup>
                        <strong>Active Load</strong><br/>
                        Lat: {activeLocation.lat}<br/>
                        Lng: {activeLocation.lng}<br/>
                        <span style={{ color: 'var(--primary)', fontWeight: 600 }}>📍 Current Location</span>
                      </Popup>
                    </Marker>
                    <MapUpdater center={activeLocation} />
                  </MapContainer>
                ) : (
                  <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
                    <Globe size={48} opacity={0.3} />
                  </div>
                )}
             </div>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 16px 0' }}>Location Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Last Updated</div>
                <div style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-primary)' }}>{lastUpdated}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Source</div>
                <div style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-primary)' }}>{source}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Coordinates</div>
                <div style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {activeLocation && activeLocation.lat !== null && activeLocation.lng !== null ? `${activeLocation.lat}, ${activeLocation.lng}` : '--'}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
