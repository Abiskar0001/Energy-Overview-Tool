import React, { useState, useEffect } from 'react';
import { Snackbar, Button } from '@mui/material';
import axios from 'axios';
import LeftComponent from './LeftComponent';
import RightComponent from './RightComponent';


export interface DataPoint {
  startTime: string;
  endTime: string;
  electricityConsumption: number;
  electricityProduction: number;
  windPowerProduction: number;
}

const ParentComponent = () => {
  const [recentData, setRecentData] = useState<{ data: any[] }>({ data: [] });
  const [fetchTime, setFetchTime] = useState<string>(() =>
    new Date().toLocaleString('en-US', { timeZone: 'Europe/Helsinki' })
  );
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedDataVariable, setSelectedDataVariable] = useState<
    keyof DataPoint
  >('electricityConsumption');
  const [selectedDataVariablePointerName, setSelectedDataVariablePointerName] =
    useState<string>('Electricity Consumption');

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

  const handleItemClick = (dataPointName: keyof DataPoint,dataPointPointerName:string) => {
    setSelectedDataVariable(dataPointName);
    setSelectedDataVariablePointerName(dataPointPointerName);
  };

  return (
    <div className="flex flex-col h-screen">
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
          onItemClick={({ dataPointName, dataPointPointerName }) =>
            handleItemClick(dataPointName, dataPointPointerName || '')
          }
        />
        <RightComponent
          recentData={recentData}
          dataVariable={selectedDataVariable}
          dataVariablePointerName={selectedDataVariablePointerName}
        />
      </div>
    </div>
  );
};

export default ParentComponent;
