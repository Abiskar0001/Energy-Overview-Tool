package com.fingrid.fingrid.service;

import com.fingrid.fingrid.response.*;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
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
	
	@Cacheable("fingridData")
	public FinalResponse fetchAndMapData() {
		ZonedDateTime currentTime = ZonedDateTime.now(ZoneOffset.UTC);
		
		ZonedDateTime roundedTime = roundToNearestQuarterHour(currentTime);
		
		FingridResponse response = fetchDataElectricity();
		try {
			Thread.sleep(2000);
		} catch (InterruptedException e) {
			Thread.currentThread().interrupt();
			e.printStackTrace();
		}
		FingridForecastResponse forecastResponse = fetchForecast();
		List<DataPointForecast> dataPoints = forecastResponse.getData();
		dataPoints.sort(Comparator.comparing(DataPointForecast::getEndTime).reversed());
		
		var sumOfData = dataPoints.stream()
						.limit(96)
						.map(DataPointForecast::getConsumptionForecast)
						.filter(Objects::nonNull)
						.mapToDouble(value -> {
							try {
								return Double.parseDouble(value);
							} catch (NumberFormatException e) {
								return 0.0;
							}})
						.sum();
		
		FinalResponse finalResponse = new FinalResponse();
		
		List<FinalDataPoint> finalDataPoints = new ArrayList<>();
		
		for (Datapoint datapoint : response.getData()) {
			FinalDataPoint finalDataPoint = new FinalDataPoint();
			
			OffsetDateTime startTime = OffsetDateTime.parse(datapoint.getStartTime(), DateTimeFormatter.ISO_OFFSET_DATE_TIME);
			OffsetDateTime endTime = OffsetDateTime.parse(datapoint.getEndTime(), DateTimeFormatter.ISO_OFFSET_DATE_TIME);
			
			finalDataPoint.setStartTime(startTime);
			finalDataPoint.setEndTime(endTime);
			
			finalDataPoint.setElectricityConsumption(datapoint.getElectricityConsumption());
			finalDataPoint.setElectricityProduction(datapoint.getElectricityProduction());
			finalDataPoint.setWindPowerProduction(datapoint.getWindPowerProduction());
			
			finalDataPoints.add(finalDataPoint);
		}
		finalDataPoints.sort(Comparator.comparing(FinalDataPoint::getEndTime).reversed());
		finalResponse.setData(finalDataPoints);
		
		if (!finalDataPoints.isEmpty()) {
			FinalDataPoint latest = finalDataPoints.getFirst();
			finalResponse.setLatestElectricityConsumption(latest.getElectricityConsumption());
			finalResponse.setLatestElectricityProduction(latest.getElectricityProduction());
			finalResponse.setLatestWindPowerProduction(latest.getWindPowerProduction());
			finalResponse.setEstimatedConsumption24Hours((float) sumOfData);
		}
		
		return finalResponse;
	}
	@Cacheable
	public FingridResponse fetchDataElectricity() throws WebClientResponseException {
		ZoneId finnishZone = ZoneId.of("Europe/Helsinki");
		ZonedDateTime endTimeZdt = ZonedDateTime.now(finnishZone);
		String endTime = endTimeZdt.format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'"));
		
		ZonedDateTime startTimeZdt = endTimeZdt.minusDays(1);
		String startTime = startTimeZdt.format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'"));
		
		String datasets = "192,193,181";
		String pageSize = "3000";
		String locale = "en";
		
		String uri = UriComponentsBuilder.fromHttpUrl("https://data.fingrid.fi/api/data")
						.queryParam("datasets", datasets)
						.queryParam("startTime", startTime)
						.queryParam("endTime", endTime)
						.queryParam("format", "json")
						.queryParam("pageSize", pageSize)
						.queryParam("locale", locale)
						.queryParam("sortBy", "endTime")
						.queryParam("sortOrder", "desc")
						.queryParam("oneRowPerTimePeriod","true")
						.toUriString();
		
		try {
			return webClient.get()
							.uri(uri)
							.header("x-api-key", apiKey)
							.retrieve()
							.bodyToMono(FingridResponse.class)
							.block();
		} catch (WebClientResponseException e) {
			if (e.getStatusCode().value() == 429) {
				try {
					Thread.sleep(2000);
					return webClient.get()
									.uri(uri)
									.header("x-api-key", apiKey)
									.retrieve()
									.bodyToMono(FingridResponse.class)
									.block();
				} catch (InterruptedException interruptedException) {
					Thread.currentThread().interrupt();
					throw new RuntimeException("Retry interrupted", interruptedException);
				} catch (WebClientResponseException retryException) {
					// If the retry also fails, throw the exception
					throw new RuntimeException("Retry failed: " + retryException.getMessage(), retryException);
				}
			}
			throw e;
		}
	}
	@Cacheable
	public FingridForecastResponse fetchForecast(){
		OffsetDateTime oneDayAgo = OffsetDateTime.now(ZoneId.of("Europe/Helsinki")).minusDays(1);
		String startTime = oneDayAgo.format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'"));
		
		String datasets = "165";
		String pageSize = "3000";
		String locale = "en";
		
		String uri = UriComponentsBuilder.fromHttpUrl("https://data.fingrid.fi/api/data")
						.queryParam("datasets", datasets)
						.queryParam("startTime", startTime)
						.queryParam("format", "json")
						.queryParam("pageSize", pageSize)
						.queryParam("locale", locale)
						.queryParam("sortBy", "endTime")
						.queryParam("sortOrder", "desc")
						.queryParam("oneRowPerTimePeriod","true")
						.toUriString();
		
		try {
			return webClient.get()
							.uri(uri)
							.header("x-api-key", apiKey)
							.retrieve()
							.bodyToMono(FingridForecastResponse.class)
							.block();
		} catch (WebClientResponseException e) {
			if (e.getStatusCode().value() == 429) {
				// Handle 429 error: Implement a backoff/retry strategy
				System.out.println("Rate limit exceeded: " + e.getMessage());
				try {
					Thread.sleep(2000);
					return webClient.get()
									.uri(uri)
									.header("x-api-key", apiKey)
									.retrieve()
									.bodyToMono(FingridForecastResponse.class)
									.block();
				} catch (InterruptedException interruptedException) {
					Thread.currentThread().interrupt();
					throw new RuntimeException("Retry interrupted", interruptedException);
				} catch (WebClientResponseException retryException) {
					// If the retry also fails, throw the exception
					throw new RuntimeException("Retry failed: " + retryException.getMessage(), retryException);
				}
			}
			throw e;  // Re-throw the exception if it's not a 429
		}
	}
	
	public static ZonedDateTime roundToNearestQuarterHour(ZonedDateTime dt) {
		int minute = dt.getMinute();
		int second = dt.getSecond();
		int nano   = dt.getNano();
		
		int totalSeconds = minute * 60 + second;
		int quarterSec   = 15 * 60;
		
		int roundedSeconds = Math.toIntExact(
						Math.round(totalSeconds / (double)quarterSec) * quarterSec
		);
		
		int newMinute = (roundedSeconds / 60) % 60;
		int newHourCarry = (roundedSeconds / 3600);
		
		ZonedDateTime rounded = dt
						.withSecond(0)
						.withNano(0)
						.plusHours(newHourCarry)
						.withMinute(newMinute);
		
		return rounded;
	}
}
