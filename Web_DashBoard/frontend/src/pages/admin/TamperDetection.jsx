import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { ShieldAlert, Unlock, Camera, Video, MapPin, Clock, Battery, Thermometer, ShieldCheck } from 'lucide-react';

export default function TamperDetection() {
  const { containerData } = useTelemetry();
  
  // Trigger tamper alert if hardware reports it, or if no data yet assume secure
  const isTampered = containerData?.tamper === true;
  const timestamp = containerData?.timestamp || Date.now();
  const location = containerData?.gps || { lat: 23.7957, lng: 86.4304 };

  return (
    <div>
      <h1 className="page-title">Tamper Detection</h1>
      <p className="page-subtitle mb-24">Real-time physical security monitoring for containers</p>
      
      {!isTampered ? (
        <div className="card" style={{ border: '1px solid var(--success-border)', background: 'var(--success-bg)' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
             <div style={{ background: 'var(--success)', padding: '20px', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <ShieldCheck size={40} />
             </div>
             <div>
               <h2 style={{ fontSize: '1.5rem', color: 'var(--success)', margin: '0 0 8px 0', fontWeight: 700 }}>SYSTEM SECURE</h2>
               <div style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.5 }}>
                 Hardware tamper sensors are actively monitoring the container doors. 
                 <br />
                 No unauthorized access or physical breaches detected.
               </div>
               {containerData && (
                 <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                   Last checked: {new Date(containerData.timestamp).toLocaleTimeString()}
                 </div>
               )}
             </div>
           </div>
        </div>
      ) : (
        <div className="grid gap-24 mb-24" style={{ animation: 'pulse 2s infinite' }}>
          <div className="card" style={{ border: '2px solid var(--danger)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                 <div style={{ background: 'var(--danger)', padding: '20px', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <Unlock size={40} />
                 </div>
                 <div>
                   <h2 style={{ fontSize: '1.75rem', color: 'var(--danger)', margin: '0 0 4px 0', fontWeight: 800 }}>CRITICAL: BREACH DETECTED</h2>
                   <div style={{ color: 'var(--danger)', fontWeight: 600, fontSize: '1.125rem' }}>UNAUTHORIZED CONTAINER OPENING</div>
                 </div>
              </div>
            </div>
            
            <div className="grid grid-2 gap-16 mb-24">
              <div style={{ background: 'var(--danger-bg)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={16} /> Breach Timestamp
                </div>
                <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--danger)' }}>
                  {new Date(timestamp).toLocaleString()}
                </div>
              </div>
              <div style={{ background: 'var(--danger-bg)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={16} /> Location Coordinates
                </div>
                <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--danger)' }}>
                  {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </div>
                <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                  <a href={`https://www.google.com/maps?q=${location.lat},${location.lng}`} target="_blank" rel="noreferrer" style={{ color: 'var(--danger)', textDecoration: 'underline', fontWeight: 600 }}>
                    View Incident Location on Map
                  </a>
                </div>
              </div>
              <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Thermometer size={16} /> Internal Environment
                </div>
                <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                  {containerData?.temperature ?? '--'}°C / {containerData?.humidity ?? '--'}%
                </div>
              </div>
              <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Battery size={16} /> Power Status
                </div>
                <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                  {containerData?.battery ?? '--'}% Battery
                </div>
              </div>
            </div>

            <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--danger)' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '4px', color: 'var(--danger)' }}>Action Required</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Immediate dispatch required. The incident has been cryptographically signed by the ESP32 hardware and logged to the hash chain. This event cannot be erased or manipulated.
              </div>
            </div>
          </div>

          <div className="card">
            <h2 style={{ fontSize: '1.125rem', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Camera size={20} color="var(--primary)" /> Evidence Capture (Camera)
            </h2>
            <div style={{ background: '#000', borderRadius: 'var(--radius-md)', height: '240px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ef4444', border: '1px solid var(--danger)' }}>
              <Video size={48} style={{ marginBottom: '16px', opacity: 0.8 }} />
              <span style={{ fontWeight: 600, letterSpacing: '2px' }}>RECORDING ACTIVE</span>
              <span style={{ fontSize: '0.75rem', marginTop: '8px', color: '#64748B' }}>Stream initializing from secondary camera...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
