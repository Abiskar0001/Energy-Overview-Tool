import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ElectricityIcon from '../assets/electricity.svg';
import ElectricityHome from '../assets/electricity-home.svg';
import WindPowerIcon from '../assets/electricity-wind.svg';
import ForecastIcon from '../assets/forecast.svg';

interface LeftComponentProps {}

const LeftComponent: React.FC<LeftComponentProps> = () => {
    const [recentData, setRecentData] = useState<any>(null);
    const [data, setData] = useState({
        consumption: null,
        production: null,
        wind: null,
        forecast: null
    });

    const fetchData = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/latest-data');
            console.log("Response data:", response.data);
            setRecentData(response.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        console.log("useEffect triggered");
        fetchData();
    }, []);

    const items = [
        {
            id: 1,
            label: `Electricity Consumption Now: ${recentData?.value ?? '---'} MW`,
            icon: ElectricityHome
        },
        {
            id: 2,
            label: `Production Now: ${recentData?.value ?? '---'} MW`,
            icon: ElectricityIcon
        },
        {
            id: 3,
            label: `Wind Power Now: ${recentData?.value ?? '---'} MW`,
            icon: WindPowerIcon
        },
        {
            id: 4,
            label: 'Forecasted Electricity Price: --- €/MWh',
            icon: ForecastIcon
        },
    ];

    return (
        <div className="left-component p-6 bg-gray-100 h-full w-5/10">
            {items.map((item) => (
                <div
                    key={item.id}
                    className="item flex items-center p-7 mb-6 bg-white rounded shadow hover:bg-gray-200 transition flex-grow"
                >
                    <img src={item.icon} alt={item.label} className="icon w-20 h-20 mr-3 " />
                    <span className="label text-xl font-mono p-9 font-bold">{item.label}</span>
                </div>
            ))}
            <button 
                className="refresh-button mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                onClick={() => window.location.reload()}
            >
                Refresh 
            </button>
        </div>
    );
};

export default LeftComponent;
