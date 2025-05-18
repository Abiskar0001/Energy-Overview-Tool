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

interface RightComponentProps {
  onReturnToHome: () => void;
  recentData: {
    estimatedConsumption24Hours: number;
    latestElectricityConsumption: number;
    latestElectricityProduction: number;
    data: DataPoint[];
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

      <div className="mt-6 bg-white rounded-xl shadow p-4">
        {multipleVariables && (
          <h2 className="text-xl text-gray-700 mt-2 font-mono">
            Click on a point in the line chart to see detailed breakdown below.
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
        <div className="w-full flex-1 min-h-[480px] mt-6 bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-semibold text-gray-800">
              Energy Source Breakdown
            </h2>
            <button
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm px-3 py-1 rounded"
              onClick={resetToCurrent}
            >
              Reset to Current
            </button>
          </div>
          <p className="text-gray-600 mb-4">
            Showing data from:{' '}
            <span className="font-mono text-blue-800">
              {new Date(pieDataSource.endTime).toLocaleString()}
            </span>
          </p>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Tooltip />
              <Legend />
              {(() => {
                const wind = pieDataSource.windPowerProduction;
                const hydro = pieDataSource.hydroProduction;
                const nuclear = pieDataSource.nuclearPowerProduction;
                const cogeneration = pieDataSource.industrialCogeneration;

                const totalKnown = wind + hydro + nuclear + cogeneration;
                const totalConsumption =
                  recentData.latestElectricityConsumption;
                const others = Math.max(totalConsumption - totalKnown, 0);

                const pieData = [
                  { name: 'Wind', value: wind },
                  { name: 'Hydro', value: hydro },
                  { name: 'Nuclear', value: nuclear },
                  { name: 'Cogeneration', value: cogeneration },
                  { name: 'Others', value: others },
                ];

                const colors = [
                  'green',
                  'blue',
                  'purple',
                  'orange',
                  '#d1d5db',
                ];

                return (
                  <Pie
                    dataKey="value"
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {colors.map((color, index) => (
                      <Cell key={index} fill={color} />
                    ))}
                  </Pie>
                );
              })()}
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {!multipleVariables && dataVariable && (
        <HighLowComponent recentData={recentData} dataVariable={dataVariable} />
      )}
    </div>
  );
};

export default RightComponent;
