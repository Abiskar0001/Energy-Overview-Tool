import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface NextDayPricesChartProps {
  nextDayPrices: { time: string; price: number }[];
}

const NextDayPricesChart: React.FC<NextDayPricesChartProps> = ({ nextDayPrices }) => {
  const formattedData = nextDayPrices.map(({ time, price }) => ({
    time,
    price,
  }));

  return (
    <div className="mt-6 bg-white rounded-xl shadow p-4">
      <h2 className="text-xl font-semibold text-gray-800 font-mono mb-4">
        Next 24 Hours Electricity Price Forecast (€/MWh)
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            tickFormatter={(t) =>
              new Date(t).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })
            }
            ticks={formattedData
              .map((d) => d.time)
              .filter((t) => new Date(t).getMinutes() === 0)}
            label={{ value: 'Time', position: 'bottom', offset: 0 }}
          />
          <YAxis />
          <Tooltip
            labelFormatter={(label: string) =>
              new Date(label).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })
            }
            formatter={(value: number) => `€${value.toFixed(2)} / MWh`}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#8884d8"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NextDayPricesChart;
