package com.fingrid.fingrid.response;

import lombok.Data;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Data
@Component
public class FinalResponse {
	private Float latestElectricityConsumption;
	private Float latestElectricityProduction;
	private Float latestWindPowerProduction;
	private Float estimatedConsumption24Hours;
	private Float latestHydroProduction;
	private Float latestNuclearPowerProduction;
	private Float latestIndustrialGeneration;
	private List<FinalDataPoint> data;
	private List<TimePricePair> nextDayPrices;
	private List<DataPointForecast> forecastData;
}
