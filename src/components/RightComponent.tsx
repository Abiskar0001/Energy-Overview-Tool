import React from 'react';
import {
  ResponsiveContainer,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import LineChartComponent from './analytics/LineChartComponent';
import { DataPoint } from './ParentComponent';

interface RightComponentProps {
  recentData: {
    data: {
      startTime: string;
      endTime: string;
      electricityConsumption: number;
      electricityProduction: number;
      windPowerProduction: number;
    }[];
  };
}

interface RightComponentProps {
  recentData: {
    data: DataPoint[];
  };
  dataVariable: keyof DataPoint;
  dataVariablePointerName: string;
}

const RightComponent: React.FC<RightComponentProps> = ({
  recentData,
  dataVariable,
  dataVariablePointerName,
}) => {
  return (
    <div className='right-component p-6 bg-gray-100 h-screen flex flex-col w-6/10 overflow-auto border'>
      <h1 className='text-4xl font-bold font-mono text-center'>{dataVariablePointerName} Analytics</h1>
      <LineChartComponent
        recentData={recentData}
        dataVariable={dataVariable}
        dataVariablePointerName={dataVariablePointerName}
      />
    </div>
  );
};

export default RightComponent;
