import { DataPoint } from '../ParentComponent';
import React from 'react';

interface HighLowCurrentComponentProps {
  recentData: { data: DataPoint[] };
  dataVariable: keyof DataPoint;
}

interface StatusBoxProps {
  label: string;
  value?: number;
  lastUpdated?: string;
}

const StatusBox: React.FC<StatusBoxProps> = ({ label, value, lastUpdated }) => {
  return (
    <div className="status-box flex flex-col justify-between p-4 rounded-2xl flex-1 m-2 w-full bg-white shadow-md border border-gray-200">
      <span className="text-xl font-mono text-center text-gray-600 truncate mb-2">
        {label}
      </span>

      <div className="flex-grow flex items-center justify-center">
        <div className="flex p-4 items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white text-3xl font-semibold shadow-xl">
          {value != null ? value : '—'}
        </div>
      </div>

      <span className="text-xs font-mono text-gray-400 text-right">
        {lastUpdated
          ? `At ${new Date(lastUpdated).toLocaleString('en-US', {
              timeZone: 'Europe/Helsinki',
              day: '2-digit',
              month: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })}`
          : ''}
      </span>
    </div>
  );
};

const HighLowCurrentComponent: React.FC<HighLowCurrentComponentProps> = ({
  recentData,
  dataVariable,
}) => {
  const data = recentData.data;
  const validData = data.filter((d) => typeof d[dataVariable] === 'number');

  const current = data.length > 0 ? data[0] : null;

  const lowest =
    validData.length > 0
      ? validData.reduce((min, d) =>
          d[dataVariable] < min[dataVariable] ? d : min
        )
      : null;

  const highest =
    validData.length > 0
      ? validData.reduce((max, d) =>
          d[dataVariable] > max[dataVariable] ? d : max
        )
      : null;

  return (
    <div className="high-low-current-component flex flex-row p-6 text-2xl font-mono">
      <StatusBox label="Current" value={current?.[dataVariable] as number | undefined} lastUpdated={current?.endTime} />
      <StatusBox label="Lowest during last 24h" value={lowest?.[dataVariable] as number | undefined} lastUpdated={lowest?.endTime}/>
      <StatusBox label="Highest during last 24h" value={highest?.[dataVariable] as number | undefined} lastUpdated={highest?.endTime}/>

    </div>
  );
};

export default HighLowCurrentComponent;
