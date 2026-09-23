import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { useSettings } from '../../context/SettingsContext';
import { ShieldAlert, Wind } from 'lucide-react';
import { InfoTooltip } from '../../components/common/StatusBadge';
import { SensorChart } from '../../components/common/SensorChart';

export default function GasSafety() {
  const { driverData, containerData, driverHistory, containerHistory } = useTelemetry();
  const { classifyMQ3, classifyMQ6 } = useSettings();

  const mq3Class = classifyMQ3(driverData?.mq3);
  const mq6Class = classifyMQ6(containerData?.mq6);

  return (
    <div>
      <h1 className="page-title">Gas & Safety Monitoring</h1>
      <p className="page-subtitle mb-24">Environmental hazards and driver safety metrics</p>

      <div className="grid grid-2 gap-24 mb-24">
        {/* Alcohol Risk */}
        <div className="card" style={{ border: mq3Class.level >= 2 ? `1px solid ${mq3Class.color}` : '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.125rem', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={20} color={mq3Class.color} /> 
                Driver Alcohol Risk Index
                <InfoTooltip text="Prototype proxy based on MQ-series gas sensor readings. A calibrated sensor is required for actual BAC measurement. Do not use for legal/medical purposes." />
              </h2>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>FT-TRK-001 • MQ3 Sensor</div>
            </div>
            <div style={{ background: `${mq3Class.color}15`, color: mq3Class.color, padding: '4px 12px', borderRadius: '20px', fontSize: '0.8125rem', fontWeight: 600 }}>
              {mq3Class.status}
            </div>
          </div>
          
          <div style={{ fontSize: '3rem', fontWeight: 700, color: mq3Class.color, marginBottom: '20px' }}>
            {driverData?.mq3 ?? '--'}
          </div>

          <SensorChart 
            data={driverHistory} 
            dataKey="mq3" 
            color={mq3Class.color} 
            name="Alcohol Risk" 
            unit="idx" 
            yDomain={[0, 1023]} 
          />
        </div>

        {/* Ethylene / Gas Proxy */}
        <div className="card" style={{ border: mq6Class.level >= 2 ? `1px solid ${mq6Class.color}` : '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.125rem', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wind size={20} color={mq6Class.color} /> 
                Ethylene Proxy Index
                <InfoTooltip text="Prototype proxy based on MQ-series gas sensor readings. A calibrated ethylene sensor is required for actual ppm measurement." />
              </h2>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>FT-CNT-001 • MQ6 Sensor</div>
            </div>
            <div style={{ background: `${mq6Class.color}15`, color: mq6Class.color, padding: '4px 12px', borderRadius: '20px', fontSize: '0.8125rem', fontWeight: 600 }}>
              {mq6Class.status}
            </div>
          </div>
          
          <div style={{ fontSize: '3rem', fontWeight: 700, color: mq6Class.color, marginBottom: '20px' }}>
            {containerData?.mq6 ?? '--'}
          </div>

          <SensorChart 
            data={containerHistory} 
            dataKey="mq6" 
            color={mq6Class.color} 
            name="Gas Index" 
            unit="idx" 
            yDomain={[0, 1023]} 
          />
        </div>
      </div>
    </div>
  );
}
