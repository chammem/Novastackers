import { LoadingSpinner } from './LoadingSpinner';

import {
    PieChart as RePieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    BarChart as ReBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
  } from 'recharts';
  
  export const PieChart = ({ data = [], colors = [] }) => (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RePieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent, value }) => 
              value > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : null
            }
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [value, 'Quantity']}
            labelFormatter={(name) => `Category: ${name}`}
          />
        </RePieChart>
      </ResponsiveContainer>
    </div>
  );
  
  export const BarChart = ({ data = [], color = '#8884d8' }) => (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <ReBarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#6b7280' }}
            axisLine={{ stroke: '#d1d5db' }}
          />
          <YAxis 
            tick={{ fill: '#6b7280' }}
            axisLine={{ stroke: '#d1d5db' }}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
            contentStyle={{
              borderRadius: '0.5rem',
              border: 'none',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}
          />
          <Bar 
            dataKey="value" 
            fill={color} 
            radius={[4, 4, 0, 0]}
            animationDuration={1500}
          />
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  );