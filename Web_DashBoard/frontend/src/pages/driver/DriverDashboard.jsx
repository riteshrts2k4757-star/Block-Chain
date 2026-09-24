import React, { useEffect, useState } from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { useAuth } from '../../context/AuthContext';
import { driverPortalService } from '../../services/driverPortal';
import { 
  Navigation, Thermometer, Droplets, Battery, AlertCircle, Loader, 
  MapPin, CheckCircle, Clock, Truck, ShieldAlert, Coffee, PowerOff, Activity 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DriverDashboard() {
  const { driverData, containerData, mqttStatus } = useTelemetry();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [dutyTimer, setDutyTimer] = useState('00:00:00');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await driverPortalService.getDashboard();
      if (res.success) setDashboardData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!dashboardData?.driver?.dutyStatusUpdatedAt) return;
    
    const interval = setInterval(() => {
      const now = new Date();
      const start = new Date(dashboardData.driver.dutyStatusUpdatedAt);
      const diff = Math.max(0, now - start); // milliseconds
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setDutyTimer(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);
    
    return () => clearInterval(interval);
  }, [dashboardData?.driver?.dutyStatusUpdatedAt]);

  const handleStatusChange = async (newStatus) => {
    if (statusUpdating || dashboardData?.driver?.dutyStatus === newStatus) return;
    try {
      setStatusUpdating(true);
      const res = await driverPortalService.updateDutyStatus(newStatus);
      if (res.success) {
        setDashboardData(prev => ({
          ...prev,
          driver: {
            ...prev.driver,
            dutyStatus: res.data.dutyStatus,
            dutyStatusUpdatedAt: res.data.dutyStatusUpdatedAt
          }
        }));
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update status. Please check your connection.');
    } finally {
      setStatusUpdating(false);
    }
  };

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
        <button className="btn btn-primary mt-16" onClick={fetchDashboard}>Retry</button>
      </div>
    );
  }

  const currentTrip = dashboardData?.currentTrip;
  const driver = dashboardData?.driver;

  const getDutyStatusConfig = (status) => {
    switch (status) {
      case 'DRIVING': return { color: 'var(--success)', icon: Truck, label: 'DRIVING' };
      case 'ON_DUTY': return { color: 'var(--info)', icon: CheckCircle, label: 'ON DUTY' };
      case 'BREAK': return { color: 'var(--warning)', icon: Coffee, label: 'ON BREAK' };
      default: return { color: 'var(--text-tertiary)', icon: PowerOff, label: 'OFF DUTY' };
    }
  };

  const statusConfig = getDutyStatusConfig(driver?.dutyStatus);
  const StatusIcon = statusConfig.icon;

  const renderTelemetryValue = (val, unit = '') => {
    return val !== undefined && val !== null ? `${val}${unit}` : '--';
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      
      {/* Header Profile Card */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, var(--text-primary), var(--text-secondary))', 
        color: 'white', padding: '24px', marginBottom: '24px', borderRadius: 'var(--radius-lg)',
        display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 8px 0' }}>Good morning, {driver?.name || user?.name}</h1>
          <div style={{ display: 'flex', gap: '16px', fontSize: '0.875rem', opacity: 0.9 }}>
            <span><strong style={{ opacity: 0.7 }}>Vehicle:</strong> {currentTrip?.containerId || 'Unassigned'}</span>
            <span><strong style={{ opacity: 0.7 }}>Trip:</strong> {currentTrip?.shipmentId || 'None'}</span>
          </div>
        </div>
        <div style={{ 
          background: 'rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '20px', 
          display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: statusConfig.color }}></div>
          {statusConfig.label}
        </div>
      </div>

      <div className="grid grid-2 gap-24 mb-24" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        
        {/* CURRENT TRIP */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={20} color="var(--primary)" /> Current Trip
            </h2>
            {currentTrip && (
              <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', borderRadius: '12px', background: currentTrip.status === 'active' ? 'var(--success-bg)' : 'var(--warning-bg)', color: currentTrip.status === 'active' ? 'var(--success)' : 'var(--warning)' }}>
                {currentTrip.status.toUpperCase()}
              </span>
            )}
          </div>
          
          {currentTrip ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Origin</div>
                  <div style={{ fontWeight: 500 }}>{currentTrip.origin}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Destination</div>
                  <div style={{ fontWeight: 500 }}>{currentTrip.destination}</div>
                </div>
              </div>
              
              <div>
                 <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>Progress</div>
                 <div style={{ height: '8px', background: 'var(--bg-hover)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: currentTrip.status === 'delivered' ? '100%' : currentTrip.status === 'active' ? '45%' : '0%', height: '100%', background: 'var(--primary)', transition: 'width 1s ease' }}></div>
                 </div>
              </div>
              
              <button className="btn btn-outline" style={{ width: '100%', marginTop: '8px' }} onClick={() => navigate('/driver/trip')}>
                View Trip Details
              </button>
            </div>
          ) : (
            <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              No active trip assigned.
            </div>
          )}
        </div>

        {/* DRIVER STATUS */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={20} color="var(--info)" /> Duty Status
            </h2>
          </div>
          
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
             <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Current Status</div>
             <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1.5rem', fontWeight: 800, color: statusConfig.color }}>
                <StatusIcon size={24} /> {statusConfig.label}
             </div>
             <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '8px', fontVariantNumeric: 'tabular-nums' }}>
                {dutyTimer}
             </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
             <button 
                onClick={() => handleStatusChange('DRIVING')}
                disabled={statusUpdating || driver?.dutyStatus === 'DRIVING'}
                className="btn" 
                style={{ 
                  background: driver?.dutyStatus === 'DRIVING' ? 'var(--success)' : 'transparent', 
                  color: driver?.dutyStatus === 'DRIVING' ? 'white' : 'var(--text-primary)',
                  border: driver?.dutyStatus === 'DRIVING' ? 'none' : '1px solid var(--border)',
                  padding: '12px'
                }}>
                <Truck size={18} /> Driving
             </button>
             <button 
                onClick={() => handleStatusChange('ON_DUTY')}
                disabled={statusUpdating || driver?.dutyStatus === 'ON_DUTY'}
                className="btn" 
                style={{ 
                  background: driver?.dutyStatus === 'ON_DUTY' ? 'var(--info)' : 'transparent', 
                  color: driver?.dutyStatus === 'ON_DUTY' ? 'white' : 'var(--text-primary)',
                  border: driver?.dutyStatus === 'ON_DUTY' ? 'none' : '1px solid var(--border)',
                  padding: '12px'
                }}>
                <CheckCircle size={18} /> On Duty
             </button>
             <button 
                onClick={() => handleStatusChange('BREAK')}
                disabled={statusUpdating || driver?.dutyStatus === 'BREAK'}
                className="btn" 
                style={{ 
                  background: driver?.dutyStatus === 'BREAK' ? 'var(--warning)' : 'transparent', 
                  color: driver?.dutyStatus === 'BREAK' ? 'white' : 'var(--text-primary)',
                  border: driver?.dutyStatus === 'BREAK' ? 'none' : '1px solid var(--border)',
                  padding: '12px'
                }}>
                <Coffee size={18} /> Break
             </button>
             <button 
                onClick={() => handleStatusChange('OFF_DUTY')}
                disabled={statusUpdating || driver?.dutyStatus === 'OFF_DUTY'}
                className="btn" 
                style={{ 
                  background: driver?.dutyStatus === 'OFF_DUTY' ? 'var(--text-tertiary)' : 'transparent', 
                  color: driver?.dutyStatus === 'OFF_DUTY' ? 'white' : 'var(--text-primary)',
                  border: driver?.dutyStatus === 'OFF_DUTY' ? 'none' : '1px solid var(--border)',
                  padding: '12px'
                }}>
                <PowerOff size={18} /> Off Duty
             </button>
          </div>
        </div>
      </div>

      {/* LIVE VEHICLE STATUS */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Activity size={20} color="var(--primary)" /> Live Vehicle Status
      </h2>
      
      <div className="grid gap-16" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        
        <div className="card" style={{ padding: '16px' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
             <Thermometer size={16} color="var(--warning)" /> Temperature
           </div>
           <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{renderTelemetryValue(containerData?.temperature, '°C')}</div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
             <Droplets size={16} color="var(--info)" /> Humidity
           </div>
           <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{renderTelemetryValue(containerData?.humidity, '%')}</div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
             <ShieldAlert size={16} color="var(--danger)" /> Container Gas
           </div>
           <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{renderTelemetryValue(containerData?.gas, ' ppm')}</div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
             <Battery size={16} color={driverData?.battery < 20 ? 'var(--danger)' : 'var(--success)'} /> Vehicle Battery
           </div>
           <div style={{ fontSize: '1.5rem', fontWeight: 700, color: driverData?.battery < 20 ? 'var(--danger)' : 'inherit' }}>
             {renderTelemetryValue(driverData?.battery, '%')}
           </div>
        </div>
        
        <div className="card" style={{ padding: '16px' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
             <Navigation size={16} color="var(--primary)" /> GPS Status
           </div>
           <div style={{ fontSize: '1.125rem', fontWeight: 700, color: mqttStatus === 'connected' ? 'var(--success)' : 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
             {mqttStatus === 'connected' ? <><CheckCircle size={18}/> Connected</> : <><AlertCircle size={18}/> Offline</>}
           </div>
        </div>
        
      </div>
      
    </div>
  );
}
