import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from 'recharts';
import { DataPoint } from '../ParentComponent';
  
  interface LineChartComponentProps {
    recentData: {
      data: DataPoint[];
    };
    dataVariable: keyof DataPoint;
    dataVariablePointerName: string;
  }

const LineChartComponent:React.FC<LineChartComponentProps> = ({recentData,dataVariable,dataVariablePointerName}) => {
    const minYValue = Math.min(
        ...recentData.data.map((d) => Number(d[dataVariable]))
      );
      const maxYValue = Math.max(
        ...recentData.data.map((d) => Number(d[dataVariable]))
      );
    
      const buffer = (maxYValue - minYValue) * 0.1; 
      const adjustedMinYValue = minYValue - buffer;
      const adjustedMaxYValue = maxYValue + buffer;
    return (
          <div className="h-7/10 w-full mt-4">
            <ResponsiveContainer>
              <LineChart
                data={[...recentData.data].reverse()}
                margin={{ top: 20, right: 30, bottom: 80, left: 50 }}
              >
                <CartesianGrid
                  stroke="#ddd"
                  strokeDasharray="5 5"
                />
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
                <Line
                  type="monotone"
                  dataKey={dataVariable}
                  stroke="#8884d8"
                  name={dataVariablePointerName}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>)
}
export default LineChartComponent;