import React from "react";

interface TugBarChartProps {
    production: number;
    consumption: number;
}

const TugBarChart: React.FC<TugBarChartProps> = ({ production, consumption }) => {
    const maxValue = Math.max(production, consumption, 1);

    // Max bar width in pixels (responsive-friendly)
    const maxBarWidthPx = 300;

    // Calculate percentage width relative to maxValue, then limit to maxBarWidthPx
    const prodWidth = Math.min((production / maxValue) * maxBarWidthPx, maxBarWidthPx);
    const consWidth = Math.min((consumption / maxValue) * maxBarWidthPx, maxBarWidthPx);

    const diff = production - consumption;
    const diffPositive = diff >= 0;

    return (
        <div className="w-full max-w-5xl px-4 mx-auto select-none font-sans text-center">
            <div className="mb-4 font-extrabold text-lg text-gray-800">
                Consumption vs Production
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center relative sm:h-12 mb-5 gap-2 sm:gap-4">
                <div
                    style={{ width: `${consWidth}px` }}
                    className="h-10 bg-red-600 rounded-l-full text-white flex items-center justify-end pr-2 font-bold text-xl shadow-md shadow-red-400 transition-all duration-700"
                    title={`Consumption: ${consumption} MW`}
                >
                    {consumption}
                </div>
                <div className="w-1 h-12 bg-gray-600 rounded" />
                <div
                    style={{ width: `${prodWidth}px` }}
                    className="h-10 bg-green-600 rounded-r-full text-white flex items-center justify-start pl-2 font-bold text-xl shadow-md shadow-green-400 transition-all duration-700"
                    title={`Production: ${production} MW`}
                >
                    {production}
                </div>
            </div>
            <div
                title={`Net difference: ${diff.toFixed(2)} MW`}
                className={`text-lg font-bold w-fit mx-auto px-4 py-2 rounded-full shadow transition-all duration-700 ${
                    diffPositive
                        ? "text-green-700 bg-green-100 shadow-green-200"
                        : "text-red-700 bg-red-100 shadow-red-200"
                }`}
            >
                Net Difference: {diffPositive ? "+" : "-"}
                {Math.abs(diff).toFixed(2)} MW
            </div>
        </div>
    );
};

export default TugBarChart;
