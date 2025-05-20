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
    forecastData?: {
      startTime: string;
      endTime: string;
      'Electricity consumption forecast - next 24 hours': string;
    }[];
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

  let currentForecast: number | null = null;
  let offset: number | null = null;

  if (
    multipleVariables &&
    recentData.forecastData &&
    recentData.data &&
    recentData.data.length > 0
  ) {
    const now = new Date();

    const closestForecast = recentData.forecastData.reduce((prev, curr) => {
      const prevDiff = Math.abs(
        new Date(prev.startTime).getTime() - now.getTime()
      );
      const currDiff = Math.abs(
        new Date(curr.startTime).getTime() - now.getTime()
      );
      return currDiff < prevDiff ? curr : prev;
    });

    const forecastValueRaw =
      closestForecast['Electricity consumption forecast - next 24 hours'];
    const parsedForecast = parseFloat(forecastValueRaw);

    if (!isNaN(parsedForecast)) {
      currentForecast = parsedForecast;

      const matchingActual = recentData.data.find((item) => {
        const actualTime = new Date(item.startTime).getTime();
        const forecastTime = new Date(closestForecast.startTime).getTime();
        return Math.abs(actualTime - forecastTime) <= 15 * 60 * 1000;
      });

      const actualProduction = matchingActual?.electricityProduction;

      if (typeof actualProduction === 'number') {
        offset = actualProduction - currentForecast;
      }
      console.log(
        `Current forecast: ${currentForecast}, Actual production: ${actualProduction}, Offset: ${offset}`);
    }
  }

  return (
    <div className="right-component bg-gray-100 p-6 min-h-screen w-3/5 overflow-auto flex flex-col border-l border-gray-300">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold font-mono">{chartTitle}</h1>
        {!multipleVariables && (
          <button
  className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-xl shadow-md hover:shadow-lg hover:scale-105 hover:from-blue-700 hover:to-blue-600 transition-all duration-300 font-semibold tracking-wide"
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
      {multipleVariables &&
        recentData.forecastData &&
        currentForecast !== null && (
          <div className="mt-6 bg-white rounded-xl shadow p-4">
            <h2 className="text-xl font-semibold text-gray-700 font-mono mb-2">
              Forecasted Electricity Production
            </h2>
            <div className="bg-yellow-50 text-gray-800 p-4 rounded-lg shadow mb-4">
              <p className="font-semibold font-mono">
                📊 Current Predicted Production:{' '}
                <span className="text-blue-600">
                  {currentForecast.toFixed(2)} MW
                </span>
              </p>
              {offset !== null && (
                <p className="font-mono">
                  ⚡ Offset from Forecast:{' '}
                  <span
                    className={offset > 0 ? 'text-green-600' : 'text-red-600'}
                  >
                    {offset > 0 ? '+' : ''}
                    {offset.toFixed(2)} MW (
                    {offset > 0 ? 'Underestimate' : 'Overestimate'})
                  </span>
                </p>
              )}
            </div>
            <LineChartComponent
              recentData={{
                ...recentData,
                data: recentData.forecastData.map((item) => ({
                  startTime: item.startTime,
                  endTime: item.endTime,
                  electricityProduction: parseFloat(
                    item['Electricity consumption forecast - next 24 hours']
                  ),
                  electricityConsumption: 0,
                  windPowerProduction: 0,
                  nuclearPowerProduction: 0,
                  hydroProduction: 0,
                  industrialCogeneration: 0,
                })),
              }}
              dataVariables={[
                {
                  key: 'electricityProduction',
                  label: 'Forecasted Electricity Production',
                },
              ]}
              onPointClick={() => {}}
            />
          </div>
        )}
      <div className="mt-6 bg-white rounded-xl shadow p-4">
        {multipleVariables && (
          <h2 className="text-xl text-gray-700 mt-2 font-mono">
            Click any point to see energy source breakdown for that hour in the
            pie chart below↓
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
                d Click any point on the price chart above to view hourly
                breakdown
              </p>
            </div>
            <button
              className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium text-sm px-3 py-1 rounded transition-colors flex items-center gap-1"
              onClick={resetToCurrent}
            >
              Reset to Current
            </button>
          </div>
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100 animate-pulse-once">
            <p className="text-gray-600 text-center">
              Showing data for:{' '}
              <span className="font-mono font-bold text-blue-600">
                {new Date(pieDataSource.endTime).toLocaleString([], {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
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
                const totalConsumption =
                  recentData.latestElectricityConsumption;
                const others = Math.max(totalConsumption - totalKnown, 0);

                const pieData = [
                  { name: 'Wind Power', value: wind },
                  { name: 'Hydro Power', value: hydro },
                  { name: 'Nuclear Power', value: nuclear },
                  { name: 'Industrial Cogeneration', value: cogeneration },
                  { name: 'Other Sources', value: others },
                ];

                const colors = [
                  '#4ade80',
                  '#60a5fa',
                  '#a78bfa',
                  '#fb923c',
                  '#d1d5db',
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
            <div className="w-8 h-8 text-blue-500 opacity-70"></div>
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
