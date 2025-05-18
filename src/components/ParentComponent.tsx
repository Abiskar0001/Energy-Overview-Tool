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
  nuclearPowerProduction: number;
  hydroProduction: number;
  industrialCogeneration: number;
}

const ParentComponent = () => {
  const [recentData, setRecentData] = useState<{
    latestElectricityConsumption: number;
    latestElectricityProduction: number;
    estimatedConsumption24Hours: number;
    data: DataPoint[];
  }>({
    estimatedConsumption24Hours: 0,
    latestElectricityConsumption: 0,
    latestElectricityProduction: 0,
    data: [],
  });
  const [fetchTime, setFetchTime] = useState<string>(() =>
    new Date().toLocaleString('en-US', { timeZone: 'Europe/Helsinki' })
  );
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedDataVariable, setSelectedDataVariable] = useState<
    keyof DataPoint | 'allProduction'
  >('allProduction');
  const [selectedDataVariablePointerName, setSelectedDataVariablePointerName] =
    useState<string>('Combined Production');

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
    }, 60000*3);

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

  const handleItemClick = (
    dataPointName: keyof DataPoint,
    dataPointPointerName: string
  ) => {
    setSelectedDataVariable(dataPointName);
    setSelectedDataVariablePointerName(dataPointPointerName);
  };

  const productionVariables = [
    {
      key: 'windPowerProduction' as keyof DataPoint,
      label: 'Wind Power Production',
      color: 'green',
    },
    {
      key: 'hydroProduction' as keyof DataPoint,
      label: 'Hydro Power Production',
      color: 'blue',
    },
    {
      key: 'nuclearPowerProduction' as keyof DataPoint,
      label: 'Nuclear Power Production',
      color: 'purple',
    },
    {
      key: 'industrialCogeneration' as keyof DataPoint,
      label: 'Industrial Cogeneration',
      color: 'orange',
    },
  ];

  const multipleVariables =
    selectedDataVariable === 'allProduction' ? productionVariables : undefined;

  const handleReturnToHome = () => {
    console.log('Returning to home');
    setSelectedDataVariable('allProduction');
    setSelectedDataVariablePointerName('Combined Production');
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
          onReturnToHome={handleReturnToHome}
          recentData={recentData}
          dataVariable={
            selectedDataVariable === 'allProduction'
              ? 'electricityProduction'
              : selectedDataVariable
          }
          dataVariablePointerName={selectedDataVariablePointerName}
          multipleVariables={
            selectedDataVariable === 'allProduction'
              ? productionVariables
              : undefined
          }
        />
      </div>
    </div>
  );
};

export default ParentComponent;
