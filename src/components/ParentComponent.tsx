import React, { useState, useEffect } from 'react';
import { Snackbar, Button } from '@mui/material';
import axios from 'axios';
import LeftComponent from './LeftComponent';
import RightComponent, { DataPoint } from './RightComponent';

const ParentComponent = () => {
  const [recentData, setRecentData] = useState<{ data: any[] }>({ data: [] });
  const [fetchTime, setFetchTime] = useState<string>(() =>
    new Date().toLocaleString('en-US', { timeZone: 'Europe/Helsinki' })
  );
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedDataVariable, setSelectedDataVariable] = useState<
    keyof DataPoint
  >('electricityConsumption'); // Default selection

  const showSnackbar = (msg: string) => {
    setMessage(msg);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    fetchData();

    const intervalApiCaller = setInterval(() => {
      fetchData();
    }, 60000);

    return () => clearInterval(intervalApiCaller);
  }, []);

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

  const handleItemClick = (dataPointName: keyof DataPoint) => {
    setSelectedDataVariable(dataPointName);
  };

  return (
    <>
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        message={message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
      <div className="parent-component flex h-screen w-full">
        <LeftComponent
          recentData={recentData}
          fetchTime={fetchTime}
          onRefresh={fetchData}
          onItemClick={handleItemClick}
        />
        <RightComponent
          recentData={recentData}
          dataVariable={selectedDataVariable} 
        />
      </div>
    </>
  );
};

export default ParentComponent;
