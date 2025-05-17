import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  Legend,
} from 'recharts';
import { DataPoint } from '../ParentComponent';

interface LineChartComponentProps {
  recentData: {
    data: DataPoint[];
  };
  dataVariables: {
    key: keyof DataPoint;
    label: string;
    color?: string;
  }[];
}

const LineChartComponent: React.FC<LineChartComponentProps> = ({
  recentData,
  dataVariables,
}) => {
  const allValues = recentData.data.flatMap((d) =>
    dataVariables.map((v) => Number(d[v.key]))
  );
  const minYValue = Math.min(...allValues);
  const maxYValue = Math.max(...allValues);
  const buffer = (maxYValue - minYValue) * 0.1;
  const adjustedMinYValue = minYValue - buffer;
  const adjustedMaxYValue = maxYValue + buffer;

  return (
    <div className="h-3/5 w-full mt-4">
      <ResponsiveContainer>
        <LineChart
          data={[...recentData.data].reverse()}
          margin={{ top: 20, right: 30, bottom: 80, left: 50 }}
        >
          <CartesianGrid stroke="#ddd" strokeDasharray="5 5" />
          <XAxis
            dataKey="endTime"
            tickFormatter={(t) =>
              new Date(t).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })
            }
            ticks={recentData.data
              .map((d) => d.endTime)
              .filter((t) => new Date(t).getMinutes() === 0)}
            label={{ value: 'Time', position: 'bottom', offset: 0 }}
          />
          <YAxis
            domain={[
              Math.floor(adjustedMinYValue / 10) * 10,
              Math.ceil(adjustedMaxYValue / 10) * 10,
            ]}
            ticks={(() => {
              const min = Math.floor(minYValue / 10) * 10;
              const max = Math.ceil(maxYValue / 10) * 10;
              const range = max - min;
              const step = Math.max(10, Math.ceil(range / 7 / 10) * 10);
              const ticks = [];
              for (let val = min; val <= max; val += step) {
                ticks.push(val);
              }
              return ticks;
            })()}
            tickFormatter={(val) => val.toFixed(0)}
          />
          <Tooltip
            labelFormatter={(label: string) =>
              new Date(label).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })
            }
          />
          <Legend verticalAlign="top" height={36} />
          {dataVariables.map((variable, index) => (
            <Line
              key={variable.key as string}
              type="monotone"
              dataKey={variable.key}
              stroke={variable.color || ['#8884d8', '#82ca9d', '#ff7300'][index % 3]}
              name={variable.label}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChartComponent;
