import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function SensorChart({ data, dataKey, color, name, unit, yDomain = ['auto', 'auto'] }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
        Waiting for data...
      </div>
    );
  }

  return (
    <div style={{ height: 250, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
          <XAxis 
            dataKey="time" 
            tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} 
            axisLine={false} 
            tickLine={false} 
            minTickGap={30}
          />
          <YAxis 
            domain={yDomain}
            tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} 
            axisLine={false} 
            tickLine={false} 
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--bg-card)', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-sm)',
              fontSize: '0.875rem'
            }}
            formatter={(value) => [`${value} ${unit}`, name]}
            labelStyle={{ color: 'var(--text-secondary)', marginBottom: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color} 
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, fill: color, stroke: 'var(--bg-card)', strokeWidth: 2 }}
            isAnimationActive={false} // Disable animation for live data to prevent weird sliding
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
