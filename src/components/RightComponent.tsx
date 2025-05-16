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
import HighLowComponent from './analytics/HighLowCurrentComponent';

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
    <div className='right-component bg-gray-100 p-6 min-h-screen w-3/5 overflow-auto flex flex-col border-l border-gray-300'>
      <h1 className='text-4xl font-bold font-mono text-center'>{dataVariablePointerName} Analytics</h1>
      <LineChartComponent
        recentData={recentData}
        dataVariable={dataVariable}
        dataVariablePointerName={dataVariablePointerName}
      />
      <HighLowComponent
        recentData={recentData}
        dataVariable={dataVariable}
      />
    </div>
  );
};

export default RightComponent;
