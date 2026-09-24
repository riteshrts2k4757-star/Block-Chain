import React, { useEffect, useState } from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { useAuth } from '../../context/AuthContext';
import { TelemetryCard } from '../../components/common/TelemetryCard';
import { Navigation, Thermometer, Droplets, Battery, AlertCircle, Loader } from 'lucide-react';
import { driverPortalService } from '../../services/driverPortal';

export default function DriverDashboard() {
  const { driverData, containerData } = useTelemetry();
  const { user } = useAuth();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await driverPortalService.getDashboard();
        if (res.success) setDashboardData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-secondary)' }}>
        <Loader size={40} className="animate-spin mb-16" />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--danger)', border: '1px solid var(--danger-border)', background: 'var(--danger-bg)' }}>
        <AlertCircle size={40} style={{ margin: '0 auto 16px auto' }} />
        <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Error Loading Dashboard</h2>
        <p>{error}</p>
      </div>
    );
  }

  const currentTrip = dashboardData?.currentTrip;
  const driver = dashboardData?.driver;

  return (
    <div>
      <div className="card" style={{ background: 'linear-gradient(135deg, var(--info-dark), var(--info))', color: 'white', padding: '24px', marginBottom: '24px', borderRadius: 'var(--radius-lg)' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 8px 0' }}>Welcome, {driver?.name || user?.name}</h1>
        <p style={{ margin: 0, opacity: 0.9 }}>
          {currentTrip ? \`Trip \${currentTrip.shipmentId} • \${currentTrip.containerId}\` : 'No active trip assigned.'}
        </p>
      </div>

      <div className="grid grid-2 gap-16 mb-24">
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
          <div style={{ background: 'var(--bg-hover)', padding: '12px', borderRadius: '12px' }}><Navigation size={24} color="var(--info)" /></div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{driverData?.speed ?? '--'} <span style={{ fontSize: '1rem', color: 'var(--text-tertiary)' }}>km/h</span></div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Current Speed</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
          <div style={{ background: 'var(--bg-hover)', padding: '12px', borderRadius: '12px' }}><Battery size={24} color={driverData?.battery < 20 ? 'var(--danger)' : 'var(--success)'} /></div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: driverData?.battery < 20 ? 'var(--danger)' : 'inherit' }}>{driverData?.battery ?? '--'}%</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Truck Node Battery</div>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.125rem', marginBottom: '16px' }}>Container Status</h2>
      <div className="grid grid-2 gap-16">
        <TelemetryCard 
          title="Temperature" 
          value={containerData?.temperature} 
          unit="°C" 
          icon={Thermometer} 
        />
        <TelemetryCard 
          title="Humidity" 
          value={containerData?.humidity} 
          unit="%" 
          icon={Droplets} 
        />
      </div>

      <div className="card" style={{ marginTop: '24px', padding: '20px' }}>
        <h2 style={{ fontSize: '1.125rem', marginBottom: '16px' }}>Next Checkpoint</h2>
        {currentTrip ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>{currentTrip.destination}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                ETA: {currentTrip.estimatedArrival ? new Date(currentTrip.estimatedArrival).toLocaleString() : 'Calculating...'}
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => window.open(\`https://www.google.com/maps/dir/?api=1&destination=\${encodeURIComponent(currentTrip.destination)}\`, '_blank')}>
              Navigate
            </button>
          </div>
        ) : (
           <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-tertiary)', background: 'var(--bg-hover)', borderRadius: '12px' }}>
             No checkpoints available. Waiting for new trip assignment.
           </div>
        )}
      </div>
    </div>
  );
}
