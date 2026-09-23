import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Thermometer, Droplets, Wind, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function DriverDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [telemetry, setTelemetry] = useState([]);

  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/drivers/${id}/telemetry`);
        const result = await response.json();
        if (result.success) {
          setTelemetry(result.data);
        }
      } catch (err) {
        console.error('Error fetching telemetry:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTelemetry();
  }, [id]);

  if (loading) {
    return <div style={{ padding: '24px' }}>Loading driver details...</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <button 
        className="btn btn-ghost mb-24" 
        onClick={() => navigate('/admin/fleet')}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: 0 }}
      >
        <ArrowLeft size={16} /> Back to Fleet
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Driver Telemetry Details</h1>
          <p className="page-subtitle">Detailed real-time metrics for Driver ID: {id}</p>
        </div>
      </div>

      <div className="grid grid-4 gap-24 mb-24">
        <div className="card">
          <div style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Thermometer size={16} /> Avg Temp
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {(telemetry.reduce((a, b) => a + b.temperature, 0) / (telemetry.length || 1)).toFixed(1)}°C
          </div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Droplets size={16} /> Avg Humidity
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {(telemetry.reduce((a, b) => a + b.humidity, 0) / (telemetry.length || 1)).toFixed(1)}%
          </div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wind size={16} /> Avg Gas (MQ6)
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {Math.round(telemetry.reduce((a, b) => a + b.mq6, 0) / (telemetry.length || 1))} ppm
          </div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={16} /> Vibration
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {(telemetry.reduce((a, b) => a + b.vibration, 0) / (telemetry.length || 1)).toFixed(3)} G
          </div>
        </div>
      </div>

      <div className="grid grid-2 gap-24">
        {/* Environment Chart */}
        <div className="card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.125rem' }}>Temperature & Humidity</h3>
          <div style={{ flex: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetry} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis dataKey="time" stroke="var(--text-tertiary)" fontSize={12} />
                <YAxis yAxisId="left" stroke="var(--text-tertiary)" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="var(--text-tertiary)" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderRadius: 'var(--radius-sm)' }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#F59E0B" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#3B82F6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gas & Vibration Chart */}
        <div className="card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.125rem' }}>Gas & Vibration Levels</h3>
          <div style={{ flex: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetry} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis dataKey="time" stroke="var(--text-tertiary)" fontSize={12} />
                <YAxis yAxisId="left" stroke="var(--text-tertiary)" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="var(--text-tertiary)" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderRadius: 'var(--radius-sm)' }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="mq6" name="Gas MQ6 (ppm)" stroke="#EF4444" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="vibration" name="Vibration (G)" stroke="#10B981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
