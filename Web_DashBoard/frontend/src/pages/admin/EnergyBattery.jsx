import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { TelemetryCard } from '../../components/common/TelemetryCard';
import { SensorChart } from '../../components/common/SensorChart';
import { Battery, Sun } from 'lucide-react';

export default function EnergyBattery() {
  const { containerData, driverData, containerHistory, driverHistory } = useTelemetry();

  return (
    <div>
      <h1 className="page-title">Energy & Battery</h1>
      <p className="page-subtitle mb-24">Power monitoring for IoT nodes</p>

      <h2 style={{ fontSize: '1.125rem', marginBottom: '16px' }}>Container Node (ESP32)</h2>
      <div className="grid grid-2 gap-24 mb-24">
        <div className="card">
          <div style={{ display: 'flex', gap: '24px' }}>
            <div style={{ flex: 1 }}>
              <TelemetryCard 
                title="Battery Level" 
                value={containerData?.battery} 
                unit="%" 
                icon={Battery} 
                status={containerData?.battery < 20 ? 'WARNING' : 'NORMAL'}
              />
            </div>
            <div style={{ flex: 1 }}>
              <TelemetryCard 
                title="Solar Voltage" 
                value={containerData?.solar} 
                unit="V" 
                icon={Sun} 
                status={containerData?.solar < 3.0 ? 'WARNING' : 'NORMAL'}
              />
            </div>
          </div>
        </div>
        <div className="card">
          <h3 style={{ fontSize: '0.875rem', marginBottom: '12px' }}>Container Battery History</h3>
          <SensorChart data={containerHistory} dataKey="battery" color="#10B981" name="Battery" unit="%" yDomain={[0, 100]} />
        </div>
      </div>

      <h2 style={{ fontSize: '1.125rem', marginBottom: '16px' }}>Driver Node (ESP8266)</h2>
      <div className="grid grid-2 gap-24">
        <div className="card">
          <div style={{ display: 'flex', gap: '24px' }}>
            <div style={{ flex: 1 }}>
              <TelemetryCard 
                title="Battery Level" 
                value={driverData?.battery} 
                unit="%" 
                icon={Battery} 
                status={driverData?.battery < 20 ? 'WARNING' : 'NORMAL'}
              />
            </div>
            <div style={{ flex: 1 }}>
              <TelemetryCard 
                title="Solar Voltage" 
                value={driverData?.solar} 
                unit="V" 
                icon={Sun} 
                status={driverData?.solar < 3.0 ? 'WARNING' : 'NORMAL'}
              />
            </div>
          </div>
        </div>
        <div className="card">
          <h3 style={{ fontSize: '0.875rem', marginBottom: '12px' }}>Driver Battery History</h3>
          <SensorChart data={driverHistory} dataKey="battery" color="#3B82F6" name="Battery" unit="%" yDomain={[0, 100]} />
        </div>
      </div>
    </div>
  );
}
