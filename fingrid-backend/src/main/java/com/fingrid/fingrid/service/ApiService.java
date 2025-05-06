package com.fingrid.fingrid.service;

import com.fingrid.fingrid.response.Datapoint;
import com.fingrid.fingrid.response.FinalDataPoint;
import com.fingrid.fingrid.response.FinalResponse;
import com.fingrid.fingrid.response.FingridResponse;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@AllArgsConstructor
public class ApiService {
	@Value("${fingrid.apiKey}")
	private String apiKey;
	
	@Value("${fingrid.baseUrl}")
	private String baseUrl;
	
	private final WebClient webClient;
	
	private final int ELECTRICITY_PRODUCTION_DATASET = 192;
	private final int ELECTRICITY_CONSUMPTION_DATASET = 193;
	private final int WIND_POWER_PRODUCTION_DATASET = 181;
	private final int ENERGY_FORECAST_PRESENTATION = 165;
	
	public FinalResponse finalResponse(List<Datapoint> dataPoints){
		
		Map<String, FinalDataPoint> timeMap = new HashMap<>();
		float lastElectricityConsumption = 0;
		float lastElectricityProduction = 0;
		float lastWindPowerProduction = 0;
		float lastForecastedElectricityPrice = 0;
		
		for (Datapoint data : dataPoints){
			String key = data.getStartTime() + " | " + data.getEndTime();
			
			FinalDataPoint point = timeMap.getOrDefault(key,new FinalDataPoint());
			
			switch (data.getDatasetId()){
				case ELECTRICITY_PRODUCTION_DATASET:
					point.setElectricityConsumption(data.getValue());
					lastElectricityConsumption = data.getValue();
					break;
				case ELECTRICITY_CONSUMPTION_DATASET:
					point.setElectricityProduction(data.getValue());
					lastElectricityProduction = data.getValue();
					break;
				case WIND_POWER_PRODUCTION_DATASET:
					point.setWindPowerProduction(data.getValue());
					lastWindPowerProduction = data.getValue();
					break;
				case ENERGY_FORECAST_PRESENTATION:
					point.setForecastedElectricityPrice(data.getValue());
					lastForecastedElectricityPrice = data.getValue();
					break;
				
			}
		}
		return null;
	}
	
	public FingridResponse fetchData() {
		// Current time in UTC
		ZonedDateTime endTimeZdt = ZonedDateTime.now(ZoneOffset.UTC);
		ZonedDateTime startTimeZdt = endTimeZdt.minusHours(24);
		
		// Format to ISO 8601 with milliseconds and 'Z' for UTC
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
		String endTime = endTimeZdt.format(formatter);
		String startTime = startTimeZdt.format(formatter);
		
		return webClient.get()
						.uri(uriBuilder -> uriBuilder
										.path("/api/data")
										.queryParam("datasets", "165,192,193,181")
										.queryParam("startTime", startTime)
										.queryParam("endTime", endTime)
										.queryParam("format", "json")
										.queryParam("pageSize", 3000)
										.queryParam("locale", "en")
										.queryParam("sortBy", "endTime")
										.queryParam("sortOrder", "desc")
										.build())
						.header("x-api-key", apiKey)
						.retrieve()
						.bodyToMono(FingridResponse.class)
						.block();
	}
}
