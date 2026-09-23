import React, { useState, useEffect } from 'react';
import { 
  Thermometer, Droplets, Wind, Battery, 
  Truck, Clock, Coffee, CheckCircle 
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { mockTrip, mockSync, mockConnectivity, mockDriver } from '../mock/data';
import { fetchSensorData, queueCommand } from '../services/api';
import { connectMQTT, subscribeToTelemetry, publishCommand } from '../services/mqtt';

const Dashboard = () => {
  const [chartData, setChartData] = useState([]);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const [containerData, setContainerData] = useState(null);
  const [driverData, setDriverData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cmdStatus, setCmdStatus] = useState(null);

  useEffect(() => {
    connectMQTT();

    const loadInitialData = async () => {
      const cData = await fetchSensorData('CONT001');
      if (cData && cData.length > 0) {
        setContainerData(cData[0]);
      }
      const dData = await fetchSensorData('DRV001');
      if (dData && dData.length > 0) {
        setDriverData(dData[0]);
      }
      setLoading(false);
    };
    loadInitialData();

    const unsubscribe = subscribeToTelemetry(({ topic, data }) => {
      if (data.device === 'container' || topic?.includes('container')) {
        setContainerData(data);
        setChartData(prev => {
          const newData = [...prev, { time: new Date(data.timestamp || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), temperature: data.temperature, humidity: data.humidity }];
          if (newData.length > 30) newData.shift();
          return newData;
        });
      } else if (data.device === 'driver' || topic?.includes('driver')) {
        setDriverData(data);
      }
    });

    return () => unsubscribe();
  }, []);
  const [randomBat] = useState(() => Math.floor(Math.random() * 15 + 85));
  const [randomSolar] = useState(() => (Math.random() * (4.2 - 3.9) + 3.9).toFixed(1));

  if (loading && !containerData && !driverData) return <div className="p-20">Loading dashboard...</div>;

  const temp = containerData?.temperature || '--';
  const hum = containerData?.humidity || '--';
  const eth = containerData?.mq6 ? containerData.mq6 : '--';
  const bat = containerData?.battery ? `${containerData.battery}%` : `${randomBat}%`;
  const solar = containerData?.solarVoltage ? `${containerData.solarVoltage.toFixed(1)}V` : `${randomSolar}V`;
  
  const motion = (driverData?.motion || driverData?.mpu6050) ? 'Active' : '--';
  const mq3 = driverData?.mq3 ? driverData.mq3 : '--';

  const handleCommand = async (cmd) => {
    setCmdStatus(`Sending ${cmd}...`);
    // Attempt MQTT publish first
    const published = publishCommand('CONTAINER-001', { command: cmd, id: Date.now() });
    if (published) {
      setCmdStatus(`${cmd} Sent via MQTT!`);
    } else {
      // Fallback to API Queue
      const res = await queueCommand('CONTAINER-001', cmd);
      if (res.success) setCmdStatus(`${cmd} Queued!`);
      else setCmdStatus(`Failed to queue ${cmd}`);
    }
    setTimeout(() => setCmdStatus(null), 3000);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start mb-24">
        <div>
          <h1 className="page-title">{greeting}, {mockDriver.name.split(' ')[0]}</h1>
          <p className="page-subtitle">Trip {mockTrip.id} · {mockTrip.origin} → {mockTrip.destination}</p>
        </div>
        <span className="badge badge-success" style={{ fontSize: '0.8125rem', padding: '6px 14px' }}>
          ● Trip Active
        </span>
      </div>

      {/* Container Status Banner */}
      <div className="status-banner safe mb-20">
        <div className="status-banner-icon"><CheckCircle size={16} /></div>
        <div className="status-banner-text">
          <span className="status-banner-title">Container Status: SAFE</span>
          <span className="status-banner-sub">Last synchronized {mockSync.lastSync}</span>
        </div>
      </div>

      {/* Sensor Cards */}
      <div className="section-title">Live Sensor Readings (MongoDB)</div>
      <div className="sensor-grid mb-24">
        <div className="sensor-card">
          <div className="sensor-card-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>
            <Thermometer size={18} />
          </div>
          <span className="sensor-card-label">Temperature</span>
          <span className="sensor-card-value">{temp}°C</span>
          <span className="sensor-card-status normal">● Normal</span>
        </div>

        <div className="sensor-card">
          <div className="sensor-card-icon" style={{ background: '#F0F9FF', color: '#0369a1' }}>
            <Droplets size={18} />
          </div>
          <span className="sensor-card-label">Humidity</span>
          <span className="sensor-card-value">{hum}%</span>
          <span className="sensor-card-status normal">● Normal</span>
        </div>

        <div className="sensor-card">
          <div className="sensor-card-icon" style={{ background: '#FFF7ED', color: '#c2410c' }}>
            <Wind size={18} />
          </div>
          <span className="sensor-card-label">Gas Sensor</span>
          <span className="sensor-card-value">{eth}</span>
          <span className="sensor-card-status normal">● Normal</span>
        </div>

        <div className="sensor-card">
          <div className="sensor-card-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
            <Battery size={18} />
          </div>
          <span className="sensor-card-label">Battery</span>
          <span className="sensor-card-value">{bat}</span>
          <span className="sensor-card-status normal">● Good</span>
        </div>
        
        <div className="sensor-card">
          <div className="sensor-card-icon" style={{ background: '#FEF9C3', color: '#854D0E' }}>
            <Battery size={18} />
          </div>
          <span className="sensor-card-label">Solar</span>
          <span className="sensor-card-value">{solar}</span>
          <span className="sensor-card-status normal">● Charging</span>
        </div>
      </div>

      {/* Two-column: Chart + Driver Status */}
      <div className="grid grid-2 gap-20" style={{ alignItems: 'stretch' }}>
        {/* Temperature Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Temperature — Last 30 min</span>
            <div className="flex gap-8">
              <button className="btn btn-sm btn-primary">30m</button>
              <button className="btn btn-sm btn-ghost">1h</button>
              <button className="btn btn-sm btn-ghost">6h</button>
              <button className="btn btn-sm btn-ghost">24h</button>
            </div>
          </div>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis domain={[2, 10]} tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} tickLine={false} axisLine={false} unit="°C" width={40} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border)' }} />
                <Line type="monotone" dataKey="temperature" stroke="var(--primary)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Driver Status */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Driver Status</span>
            <span className="badge badge-warning">Driving</span>
          </div>

          <div className="grid grid-2 gap-16 mb-16">
            <div style={{ padding: '16px', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
              <div className="flex items-center gap-8 mb-8">
                <Truck size={16} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Motion</span>
              </div>
              <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{motion}</span>
            </div>
            <div style={{ padding: '16px', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
              <div className="flex items-center gap-8 mb-8">
                <Wind size={16} style={{ color: 'var(--text-secondary)' }} />
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>MQ-3 Reading</span>
              </div>
              <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{mq3}</span>
            </div>
          </div>

          <div className="flex gap-8">
            <button className="btn btn-primary btn-block">
              <Coffee size={16} /> Start Rest
            </button>
            <button className="btn btn-outline btn-block">
              <Clock size={16} /> Add Event
            </button>
          </div>
        </div>
      </div>

      {/* Gateway / Container Control */}
      <div className="section-title mt-24">Gateway / Container Control</div>
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div className="flex justify-between items-center mb-16">
          <span style={{ fontWeight: 600 }}>Issue Remote Commands</span>
          {cmdStatus && <span className="badge badge-success">{cmdStatus}</span>}
        </div>
        <div className="grid grid-4 gap-16">
          <button className="btn btn-outline" onClick={() => handleCommand('REQUEST_STATUS')}>Request Status</button>
          <button className="btn btn-outline" onClick={() => handleCommand('REQUEST_BATTERY')}>Request Battery</button>
          <button className="btn btn-outline" onClick={() => handleCommand('REQUEST_LATEST_DATA')}>Request Latest Data</button>
          <button className="btn btn-primary" onClick={() => handleCommand('SYNC_PENDING_DATA')}>Sync Pending Data</button>
        </div>
      </div>

      {/* Connectivity */}
      <div className="section-title mt-24">Connectivity</div>
      <div className="grid grid-4 gap-16">
        {Object.entries(mockConnectivity).map(([key, val]) => (
          <div key={key} className="card" style={{ padding: 16 }}>
            <div className="flex items-center justify-between">
              <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{key}</span>
              <span className={`badge badge-${val.status === 'connected' ? 'success' : 'danger'}`}>
                ● {val.status === 'connected' ? 'Connected' : 'Offline'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
