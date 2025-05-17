import React from 'react';
import ElectricityIcon from '../assets/electricity.svg';
import ElectricityHome from '../assets/electricity-home.svg';
import WindPowerIcon from '../assets/electricity-wind.svg';
import ForecastIcon from '../assets/forecast.svg';
import NuclearIcon from '../assets/nuclear.svg';
import HydroIcon from '../assets/hydropower.svg';
import IndustrialIcon from '../assets/industry.svg';
import { DataPoint } from './ParentComponent';

interface LeftComponentProps {
  recentData: any;
  fetchTime: string;
  onRefresh: () => void;
  onItemClick: (params: {
    dataPointName: keyof DataPoint;
    dataPointPointerName?: string;
  }) => void;
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
    dataPointPointerName?: string;
  }[] = [
    {
      id: 2,
      label: `Electricity Consumption Now: ${recentData?.latestElectricityConsumption ?? '---'} MW`,
      icon: ElectricityHome,
      dataPointName: 'electricityConsumption',
      lastUpdated: recentData?.data?.[0]?.endTime,
      dataPointPointerName: 'Electricity Consumption',
    },
    {
      id: 3,
      label: `Total Forecasted Energy Consumption (Next 24 Hours): ${recentData?.estimatedConsumption24Hours ?? '---'} MWh`,
      icon: ForecastIcon,
      dataPointName: '',
    },
    {
      id: 4,
      label: `Wind Power Now: ${recentData?.latestWindPowerProduction ?? '---'} MW`,
      icon: WindPowerIcon,
      dataPointName: 'windPowerProduction',
      lastUpdated: recentData?.data?.[0]?.endTime,
      dataPointPointerName: 'Wind Power Production',
    },
    {
      id: 1,
      label: `Electricity Production Now: ${recentData?.latestElectricityProduction ?? '---'} MW`,
      icon: ElectricityIcon,
      dataPointName: 'electricityProduction',
      lastUpdated: recentData?.data?.[0]?.endTime,
      dataPointPointerName: 'Electricity Production',
    },
    {
      id: 5,
      label: `Hydro Power Now: ${recentData?.latestHydroProduction ?? '---'} MW`,
      icon: HydroIcon,
      dataPointName: 'hydroProduction',
      lastUpdated: recentData?.data?.[0]?.endTime,
      dataPointPointerName: 'Hydro Power Production',
    },
    {
      id: 6,
      label: `Nuclear Power Now: ${recentData?.latestNuclearPowerProduction ?? '---'} MW`,
      icon: NuclearIcon,
      dataPointName: 'nuclearPowerProduction',
      lastUpdated: recentData?.data?.[0]?.endTime,
      dataPointPointerName: 'Nuclear Power Production',
    },
    {
      id: 7,
      label: `Industrial Cogeneration: ${recentData?.latestIndustrialGeneration ?? '---'} MW`,
      icon: IndustrialIcon,
      dataPointName: 'industrialCogeneration',
      lastUpdated: recentData?.data?.[0]?.endTime,
      dataPointPointerName: 'Industrial Cogeneration',
    },
  ];

  return (
    <div className="left-component p-6 bg-gray-100 min-h-screen w-2/5 overflow-auto flex flex-col border-r border-gray-300">
      <h1 className="text-3xl font-mono font-bold text-center mb-4 text-gray-800">
        Click on the items to see more details
      </h1>
      {items
        .sort((a, b) => a.id - b.id)
        .map((item) => (
          <div
            key={item.id}
            onClick={() =>
              item.dataPointName &&
              onItemClick({
                dataPointName: item.dataPointName,
                dataPointPointerName: item.dataPointPointerName,
              })
            }
            className="item flex items-center p-4 mb-6 bg-white rounded-xl shadow cursor-pointer border border-gray-200
                      hover:bg-blue-100 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 ease-in-out
                      active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-400"
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
