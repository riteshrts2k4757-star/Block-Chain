import React, { useState, useEffect } from 'react';
import { Thermometer, Droplets, Wind, Battery, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { mockConnectivity } from '../mock/data';
import { connectMQTT, subscribeToTelemetry } from '../services/mqtt';

const Monitor = () => {
  const [chartData, setChartData] = useState([]);
  const [sensorData, setSensorData] = useState(null);

  useEffect(() => {
    connectMQTT();

    const unsubscribe = subscribeToTelemetry(({ topic, data }) => {
      if (data.device === 'container' || topic?.includes('container')) {
        setSensorData(prev => ({ ...prev, ...data }));
        setChartData(prev => {
          const time = new Date(data.timestamp || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
          const newData = [...prev, { time, temperature: data.temperature, humidity: data.humidity, ethylene: data.mq6 }];
          if (newData.length > 60) newData.shift();
          return newData;
        });
      } else if (data.device === 'driver' || topic?.includes('driver')) {
        setSensorData(prev => ({ ...prev, driverMotion: data.motion }));
      }
    });

    return () => unsubscribe();
  }, []);

  const temp = sensorData?.temperature || '--';
  const hum = sensorData?.humidity || '--';
  const eth = sensorData?.mq6 || '--';
  const bat = sensorData?.battery || '--';
  const motion = sensorData?.driverMotion ? 'Active' : '--';

  return (
    <div>
      <div className="flex justify-between items-start mb-24">
        <div>
          <h1 className="page-title">Live Monitoring</h1>
          <p className="page-subtitle">Container CONT001 — Real-time sensor data</p>
        </div>
        <div className="flex items-center gap-8">
          <span className="badge badge-success">● Live</span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Updated {sensorData ? 'recently' : 'unknown'}</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="sensor-grid mb-24">
        <SensorSummary icon={<Thermometer size={18} />} bg="var(--info-bg)" color="var(--info)"
          label="Temperature" value={`${temp}°C`}
          sub={`Min 4° · Max 7°`} status="normal" />
        <SensorSummary icon={<Droplets size={18} />} bg="#F0F9FF" color="#0369a1"
          label="Humidity" value={`${hum}%`}
          sub={`Min 78% · Max 85%`} status="normal" />
        <SensorSummary icon={<Wind size={18} />} bg="#FFF7ED" color="#c2410c"
          label="Ethylene" value={`${eth} ppm`}
          sub={`Threshold: 2.0 ppm`} status="normal" />
        <SensorSummary icon={<Battery size={18} />} bg="var(--success-bg)" color="var(--success)"
          label="Battery" value={`${bat}%`}
          sub="Solar charging" status="normal" />
        <SensorSummary icon={<Zap size={18} />} bg="#FFF7ED" color="#c2410c"
          label="Vibration" value={`${motion}`}
          sub="Within normal range" status="normal" />
      </div>

      {/* Charts */}
      <div className="section-title">Temperature Trend</div>
      <div className="card mb-20">
        <div className="card-header">
          <span className="card-subtitle">Live Stream</span>
          <div className="flex gap-8">
            <button className="btn btn-sm btn-ghost">30m</button>
            <button className="btn btn-sm btn-primary">1h</button>
            <button className="btn btn-sm btn-ghost">6h</button>
            <button className="btn btn-sm btn-ghost">24h</button>
          </div>
        </div>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis domain={[2, 10]} tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} tickLine={false} axisLine={false} unit="°C" width={40} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border)' }} />
              <Area type="monotone" dataKey="temperature" stroke="var(--primary)" fill="url(#tempGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-2 gap-20">
        {/* Humidity Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Humidity</span>
            <span className="card-subtitle">Last 60 min</span>
          </div>
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} tickLine={false} axisLine={false} interval={14} />
                <YAxis domain={[70, 95]} tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} tickLine={false} axisLine={false} unit="%" width={36} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border)' }} />
                <Line type="monotone" dataKey="humidity" stroke="#0369a1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ethylene Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Ethylene</span>
            <span className="card-subtitle">Last 60 min</span>
          </div>
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} tickLine={false} axisLine={false} interval={14} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} tickLine={false} axisLine={false} unit="ppm" width={44} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border)' }} />
                <Line type="monotone" dataKey="ethylene" stroke="#c2410c" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Gateway info */}
      <div className="section-title mt-24">Connection Details</div>
      <div className="card">
        <div className="grid grid-4 gap-16">
          <InfoItem label="Gateway SSID" value={mockConnectivity.gateway.ssid} />
          <InfoItem label="IP Address" value={mockConnectivity.gateway.ip} />
          <InfoItem label="Signal Strength" value={`${mockConnectivity.gateway.signal}%`} />
          <InfoItem label="MQTT Broker" value={mockConnectivity.mqtt.broker} />
        </div>
      </div>
    </div>
  );
};

const SensorSummary = ({ icon, bg, color, label, value, sub, status }) => (
  <div className="sensor-card">
    <div className="sensor-card-icon" style={{ background: bg, color }}>{icon}</div>
    <span className="sensor-card-label">{label}</span>
    <span className="sensor-card-value">{value}</span>
    <span className={`sensor-card-status ${status}`}>● {status === 'normal' ? 'Normal' : 'Warning'}</span>
    {sub && <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{sub}</span>}
  </div>
);

const InfoItem = ({ label, value }) => (
  <div>
    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{value}</div>
  </div>
);

export default Monitor;
