import React from 'react';
import LineChartComponent from './analytics/LineChartComponent';
import { DataPoint } from './ParentComponent';
import HighLowComponent from './analytics/HighLowCurrentComponent';

interface RightComponentProps {
  onReturnToHome : () => void;
  recentData: {
    data: DataPoint[];
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
  const chartTitle = multipleVariables
    ? 'Multiple Metrics Analytics'
    : `${dataVariablePointerName} Analytics`;


  return (
    <div className="right-component bg-gray-100 p-6 min-h-screen w-3/5 overflow-auto flex flex-col border-l border-gray-300">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold font-mono">{chartTitle}</h1>
        {!multipleVariables && (
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            onClick={() => { 
              onReturnToHome();
            }}
          >
            Return to Home
          </button>
        )}
      </div>

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
      />

      {!multipleVariables && dataVariable && (
        <HighLowComponent recentData={recentData} dataVariable={dataVariable} />
      )}
    </div>
  );
};

export default RightComponent;
