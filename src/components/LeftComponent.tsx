import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ElectricityIcon from '../assets/electricity.svg';
import ElectricityHome from '../assets/electricity-home.svg';
import WindPowerIcon from '../assets/electricity-wind.svg';
import ForecastIcon from '../assets/forecast.svg';

interface LeftComponentProps {}

const LeftComponent: React.FC<LeftComponentProps> = () => {
  const [recentData, setRecentData] = useState<any>(null);
  const [data, setData] = useState({
    consumption: null,
    production: null,
    wind: null,
    forecast: null,
  });

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:1010/api/final');
      setRecentData(response.data);
      console.log('Fetched data:', response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const items = [
    {
      id: 1,
      label: `Electricity Consumption Now: ${recentData?.latestElectricityConsumption ?? '---'} MW`,
      icon: ElectricityHome,
      lastUpdated: recentData?.data?.[0]?.endTime,
    },
    {
      id: 2,
      label: `Prior Day Forecasted Consumption: ${recentData?.estimatedConsumptionAtTheTime ?? '---'} MW`,
      icon: ForecastIcon,
    },

    {
      id: 3,
      label: `Wind Power Now: ${recentData?.latestWindPowerproduction ?? '---'} MW`,
      icon: WindPowerIcon,
      lastUpdated: recentData?.data?.[0]?.endTime,
    },
    {
      id: 4,
      label: `Electricity Production Now: ${recentData?.latestElectricityProduction ?? '---'} MW`,
      icon: ElectricityIcon,
      lastUpdated: recentData?.data?.[0]?.endTime,
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
          className="item flex items-center p-6 mb-6 bg-white rounded-2xl shadow hover:bg-gray-100 transition"
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

      <button
        className="refresh-button mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        onClick={fetchData}
      >
        Refresh
      </button>
    </div>
  );
};

export default LeftComponent;
