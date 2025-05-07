import React, { useEffect, useState } from 'react';
import { Snackbar, Button } from '@mui/material';
import axios from 'axios';
import ElectricityIcon from '../assets/electricity.svg';
import ElectricityHome from '../assets/electricity-home.svg';
import WindPowerIcon from '../assets/electricity-wind.svg';
import ForecastIcon from '../assets/forecast.svg';

interface LeftComponentProps {}

const LeftComponent: React.FC<LeftComponentProps> = () => {
  const [recentData, setRecentData] = useState<any>(null);

  const [fetchTime, setFetchTime] = useState<string>(() =>
    new Date().toLocaleString('en-US', { timeZone: 'Europe/Helsinki' })
  );
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  const showSnackbar = (msg: string) => {
    setMessage(msg);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const fetchData = async () => {
    try {
      setFetchTime('Fetching data...');
      showSnackbar('Fetching data...');
      const response = await axios.get('http://localhost:1010/api/final');
      setRecentData(response.data);
      setFetchTime(
        new Date().toLocaleString('en-US', { timeZone: 'Europe/Helsinki' })
      );
    } catch (error) {
      showSnackbar('Error fetching data. Please try again later.');
    }
  };

  const handleItemClick = (itemId: number) => {
    switch (itemId) {
      case 1:
        console.log('Electricity Consumption clicked');
        break;
      case 2:
        console.log('Forecast clicked');
        break;
      case 3:
        console.log('Wind Power clicked');
        break;
      case 4:
        console.log('Electricity Production clicked');
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    fetchData();
    const intervalApiCaller = setInterval(() => {
        fetchData(); 
      }, 60000);

      return () => clearInterval(intervalApiCaller);
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
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        message={message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
      <h1 className="text-xl font-bold text-center mb-4 text-gray-800">
        Click on the items to see more details
      </h1>
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => handleItemClick(item.id)}
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
      <div className="text-gray-500">
        <button
          className="refresh-button mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          onClick={fetchData}
        >
          Refresh
        </button>
        <a className="p-2">Last fetched: {fetchTime}</a>
      </div>
    </div>
  );
};

export default LeftComponent;
