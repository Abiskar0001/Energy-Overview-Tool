import React from 'react';
import ElectricityIcon from '../assets/electricity.svg';
import ElectricityHome from '../assets/electricity-home.svg';
import WindPowerIcon from '../assets/electricity-wind.svg';
import ForecastIcon from '../assets/forecast.svg';
import { DataPoint } from './RightComponent';

interface LeftComponentProps {
  recentData: any;
  fetchTime: string;
  onRefresh: () => void;
  onItemClick: (dataPointName: keyof DataPoint) => void; // Add the onItemClick prop
}

const LeftComponent: React.FC<LeftComponentProps> = ({
  recentData,
  fetchTime,
  onRefresh,
  onItemClick,
}) => {
  const items: {
      id: number;
      label: string;
      icon: string;
      dataPointName: keyof DataPoint | '';
      lastUpdated?: string;
  }[] = [
      {
          id: 1,
          label: `Electricity Consumption Now: ${recentData?.latestElectricityConsumption ?? '---'} MW`,
          icon: ElectricityHome,
          dataPointName: 'electricityConsumption',
          lastUpdated: recentData?.data?.[0]?.endTime
      },
      {
          id: 2,
          label: `Total Forecasted Energy Consumption (Next 24 Hours): ${recentData?.estimatedConsumption24Hours ?? '---'} MWh`,
          icon: ForecastIcon,
          dataPointName: '',
      },
      {
          id: 3,
          label: `Wind Power Now: ${recentData?.latestWindPowerProduction ?? '---'} MW`,
          icon: WindPowerIcon,
          dataPointName: 'windPowerProduction',
          lastUpdated: recentData?.data?.[0]?.endTime
      },
      {
          id: 4,
          label: `Electricity Production Now: ${recentData?.latestElectricityProduction ?? '---'} MW`,
          icon: ElectricityIcon,
          dataPointName: 'electricityProduction',
          lastUpdated: recentData?.data?.[0]?.endTime
      },
  ];

  return (
    <div className="left-component p-6 bg-gray-100 h-full w-4/10">
      <h1 className="text-xl font-bold text-center mb-4 text-gray-800">
        Click on the items to see more details
      </h1>
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => item.dataPointName && onItemClick(item.dataPointName)}
          className="item flex items-center p-6 mb-6 bg-white rounded-2xl shadow hover:bg-red-100 transition"
        >
          {/* Icon */}
          <div className="mr-6">
            <img src={item.icon} alt={item.label} className="w-16 h-16" />
          </div>

          {/* Text content */}
          <div className="flex flex-col justify-center flex-grow">
            <span className="text-2xl font-mono font-bold text-gray-800 p-6">
              {item.label}
            </span>
            {item.lastUpdated && (
              <span className="text-sm text-gray-500 text-right mt-2">
                Last updated: {new Date(item.lastUpdated).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      ))}
      <div className="text-gray-500">
        <button
          className="refresh-button mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          onClick={onRefresh}
        >
          Refresh
        </button>
        <a className="p-2">Last fetched: {fetchTime}</a>
      </div>
    </div>
  );
};

export default LeftComponent;
