import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import { useNavigate } from 'react-router-dom';
import { TruckCard } from '../../components/fleet/TruckCard';
import { useTelemetry } from '../../context/TelemetryContext';

export default function Fleet() {
  const { containerData } = useTelemetry();
  const navigate = useNavigate();
  const [fleet, setFleet] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFleet = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/drivers`);
        const result = await response.json();
        if (result.success) {
          setFleet(result.data);
        }
      } catch (err) {
        console.error('Failed to fetch fleet:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFleet();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Fleet Status</h1>
          <p className="page-subtitle">Real-time monitoring of all active trucks and containers</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input type="text" placeholder="Search vehicle or driver..." className="form-input" style={{ width: '250px' }} />
          <button className="btn btn-outline">Filter</button>
        </div>
      </div>

      {loading ? (
        <p>Loading fleet data...</p>
      ) : (
        <div className="grid grid-3 gap-24">
          {fleet.map((truck) => (
            <TruckCard 
              key={truck.truckId} 
              truck={truck} 
              telemetry={containerData} 
              onClick={() => navigate(`/admin/fleet/${truck.driver.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
