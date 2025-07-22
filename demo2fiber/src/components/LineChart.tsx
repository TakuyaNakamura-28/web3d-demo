import React from 'react';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';

interface LineChartProps {
  data: Array<{ [key: string]: any }>;
  lines: Array<{
    dataKey: string;
    name: string;
    color: string;
  }>;
  showLegend?: boolean;
  showGrid?: boolean;
}

const LineChart: React.FC<LineChartProps> = ({ 
  data, 
  lines, 
  showLegend = true, 
  showGrid = true 
}) => {
  return (
    <div className="w-full h-full flex flex-col gap-9">
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            {showGrid && (
              <CartesianGrid 
                strokeDasharray="0" 
                stroke="#e5e5e5"
                horizontal={true}
                vertical={false}
              />
            )}
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#737373' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#737373' }}
            />
            <Tooltip />
            {lines.map((line, index) => (
              <Line
                key={index}
                type="monotone"
                dataKey={line.dataKey}
                stroke={line.color}
                strokeWidth={2}
                dot={false}
                name={line.name}
              />
            ))}
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
      
      {showLegend && (
        <div className="flex flex-wrap gap-4 justify-start">
          {lines.map((line, index) => (
            <div key={index} className="flex items-center gap-1.5">
              <div 
                className="w-2 h-2 rounded-sm"
                style={{ backgroundColor: line.color }}
              />
              <span className="text-xs text-neutral-950">{line.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LineChart;