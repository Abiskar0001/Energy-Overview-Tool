import React, { useState } from 'react';
import LineChartComponent from './analytics/LineChartComponent';
import { DataPoint } from './ParentComponent';
import HighLowComponent from './analytics/HighLowCurrentComponent';
import TugChart from './analytics/TugChart';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import NextDayPricesChart from './analytics/NextDayPricesChartprops';

interface RightComponentProps {
  onReturnToHome: () => void;
  recentData: {
    estimatedConsumption24Hours: number;
    latestElectricityConsumption: number;
    latestElectricityProduction: number;
    data: DataPoint[];
    nextDayPrices: { time: string; price: number }[];
  };
  dataVariable?: keyof DataPoint;
  dataVariablePointerName?: string;
  multipleVariables?: {
    key: keyof DataPoint;
    label: string;
    color?: string;
  }[];
}

const RightComponent: React.FC<RightComponentProps> = ({
  onReturnToHome,
  recentData,
  dataVariable,
  dataVariablePointerName,
  multipleVariables,
}) => {
  const [clickedDataPoint, setClickedDataPoint] = useState<DataPoint | null>(
    null
  );

  const chartTitle = multipleVariables
    ? 'Electricity Analytics'
    : `${dataVariablePointerName} Analytics`;

  const resetToCurrent = () => {
    setClickedDataPoint(null);
  };

  const pieDataSource = clickedDataPoint || recentData.data[0];

  return (
    <div className="right-component bg-gray-100 p-6 min-h-screen w-3/5 overflow-auto flex flex-col border-l border-gray-300">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold font-mono">{chartTitle}</h1>
        {!multipleVariables && (
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            onClick={onReturnToHome}
          >
            Return to Home
          </button>
        )}
      </div>

      {multipleVariables && (
        <div className="mt-6 bg-white rounded-xl shadow p-4">
          <TugChart
            production={recentData.latestElectricityProduction}
            consumption={recentData.latestElectricityConsumption}
          />
        </div>
      )}
      {multipleVariables && (
        <div className="mt-6 bg-white rounded-2xl shadow-lg p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 font-mono mb-1">
              Total Forecasted 24-Hour Consumption From Now
            </h2>
            <p className="text-3xl font-bold text-gray-600">
              {recentData.estimatedConsumption24Hours ?? '---'} MWh
            </p>
          </div>
          <div className="text-blue-500 text-4xl">⚡</div>
        </div>
      )}
      {multipleVariables && recentData.nextDayPrices && (
  <NextDayPricesChart nextDayPrices={recentData.nextDayPrices} />
)}

      <div className="mt-6 bg-white rounded-xl shadow p-4">
        {multipleVariables && (
          <h2 className="text-xl text-gray-700 mt-2 font-mono">
            Click any point to see energy source breakdown for that hour in the pie chart below↓
          </h2>
        )}
        <LineChartComponent
          recentData={recentData}
          {...(multipleVariables
            ? { dataVariables: multipleVariables }
            : {
                dataVariables: [
                  {
                    key: dataVariable!,
                    label: dataVariablePointerName!,
                  },
                ],
              })}
          onPointClick={(entry) => {
            setClickedDataPoint(entry);
          }}
        />
      </div>

      {multipleVariables && pieDataSource && (
  <div className="w-full flex-1 min-h-[480px] mt-6 bg-white rounded-xl shadow p-4 transition-all duration-300">
    <div className="flex items-center justify-between mb-2">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800">
          Energy Source Breakdown
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Click any point on the price chart above to view hourly breakdown
        </p>
      </div>
      <button
        className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium text-sm px-3 py-1 rounded transition-colors flex items-center gap-1"
        onClick={resetToCurrent}
      >
        Reset to Current
      </button>
    </div>

    {/* Highlighted time section with animation */}
    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100 animate-pulse-once">
      <p className="text-gray-600 text-center">
        Showing data for:{' '}
        <span className="font-mono font-bold text-blue-600">
          {new Date(pieDataSource.endTime).toLocaleString([], {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </p>
    </div>

    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Tooltip 
          formatter={(value, name) => [`${value} MWh`, name]} 
          contentStyle={{ borderRadius: '8px' }}
        />
        <Legend 
          layout="horizontal" 
          verticalAlign="bottom" 
          wrapperStyle={{ paddingTop: '20px' }}
        />
        {(() => {
          const wind = pieDataSource.windPowerProduction;
          const hydro = pieDataSource.hydroProduction;
          const nuclear = pieDataSource.nuclearPowerProduction;
          const cogeneration = pieDataSource.industrialCogeneration;

          const totalKnown = wind + hydro + nuclear + cogeneration;
          const totalConsumption = recentData.latestElectricityConsumption;
          const others = Math.max(totalConsumption - totalKnown, 0);

          const pieData = [
            { name: 'Wind Power', value: wind },
            { name: 'Hydro Power', value: hydro },
            { name: 'Nuclear Power', value: nuclear },
            { name: 'Industrial Cogeneration', value: cogeneration },
            { name: 'Other Sources', value: others },
          ];

          const colors = [
            '#4ade80',  // wind - green
            '#60a5fa',  // hydro - blue
            '#a78bfa',  // nuclear - purple
            '#fb923c',  // cogeneration - orange
            '#d1d5db',  // others - gray
          ];

          return (
            <Pie
              dataKey="value"
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={40}
              paddingAngle={2}
              label={({ name, percent }) => 
                `${name} (${(percent * 100).toFixed(0)}%)`
              }
              labelLine={true}
              animationDuration={500}
              animationEasing="ease-out"
            >
              {colors.map((color, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={color} 
                  stroke="#fff"
                  strokeWidth={1}
                />
              ))}
            </Pie>
          );
        })()}
      </PieChart>
    </ResponsiveContainer>

    <div className="flex justify-center mt-2">
      <div className="w-8 h-8 text-blue-500 opacity-70">
      </div>
    </div>
  </div>
)}

      {!multipleVariables && dataVariable && (
        <HighLowComponent recentData={recentData} dataVariable={dataVariable} />
      )}
    </div>
  );
};

export default RightComponent;
