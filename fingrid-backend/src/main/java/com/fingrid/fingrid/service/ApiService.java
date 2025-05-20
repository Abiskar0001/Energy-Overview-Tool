package com.fingrid.fingrid.service;

import com.fingrid.fingrid.response.*;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.json.JSONArray;
import org.json.JSONObject;
import org.json.XML;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ApiService {
	@Value("${fingrid.apiKey}")
	private String apiKey;
	@Value("${entso.securityToken}")
	private String securityToken;
	
	@Value("${fingrid.baseUrl}")
	private String baseUrl;
	
	private final WebClient webClient;
	
	@Cacheable("fingridData")
	public FinalResponse fetchAndMapData() {
		//ZonedDateTime currentTime = ZonedDateTime.now(ZoneOffset.UTC);
		
		//ZonedDateTime roundedTime = roundToNearestQuarterHour(currentTime);
		
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
      finalDataPoint.setHydroProduction(datapoint.getHydroProduction());
      finalDataPoint.setNuclearPowerProduction(datapoint.getNuclearPowerProduction());
      finalDataPoint.setIndustrialCogeneration(datapoint.getIndustrialCogeneration());

			finalDataPoints.add(finalDataPoint);
		}
		finalDataPoints.sort(Comparator.comparing(FinalDataPoint::getEndTime).reversed());
		finalResponse.setData(finalDataPoints);
		
		if (!finalDataPoints.isEmpty()) {
			FinalDataPoint latest = finalDataPoints.getFirst();
			finalResponse.setLatestElectricityConsumption(latest.getElectricityConsumption());
			finalResponse.setLatestElectricityProduction(latest.getElectricityProduction());
			finalResponse.setLatestWindPowerProduction(latest.getWindPowerProduction());
      finalResponse.setLatestHydroProduction(latest.getHydroProduction());
      finalResponse.setLatestIndustrialGeneration(latest.getIndustrialCogeneration());
      finalResponse.setLatestNuclearPowerProduction(latest.getNuclearPowerProduction());
			finalResponse.setEstimatedConsumption24Hours((float) sumOfData);
		}
		ZonedDateTime tomorrow = ZonedDateTime.now(ZoneId.of("Europe/Helsinki")).plusDays(2);
		ZonedDateTime now = ZonedDateTime.now(ZoneId.of("Europe/Helsinki"));
		ZonedDateTime startTimeZdt = now.minusHours(12);
		
		String entsoeStart = startTimeZdt.format(DateTimeFormatter.ofPattern("yyyyMMddHHmm"));
		String entsoeEnd = tomorrow.withHour(23).withMinute(59).withSecond(0).format(DateTimeFormatter.ofPattern("yyyyMMddHHmm"));
		
		String entsoeJson = fetchEntsoeDataAsJson(entsoeStart, entsoeEnd);
		List<TimePricePair> timePricePairs = parseEntsoePrices(entsoeJson);
		finalResponse.setNextDayPrices(timePricePairs);
		
		return finalResponse;
	}
	@Cacheable
	public FingridResponse fetchDataElectricity() throws WebClientResponseException {
		ZoneId finnishZone = ZoneId.of("Europe/Helsinki");
		ZonedDateTime endTimeZdt = ZonedDateTime.now(finnishZone);
		String endTime = endTimeZdt.format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'"));
		
		ZonedDateTime startTimeZdt = endTimeZdt.minusDays(1);
		String startTime = startTimeZdt.format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'"));
		
		String datasets = "192,193,181,188,191,202";
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
			throw e;
		}
	}
	
	public String fetchEntsoeDataAsJson(String start, String end) {
		String uri = UriComponentsBuilder.fromHttpUrl("https://web-api.tp.entsoe.eu/api")
						.queryParam("securityToken", securityToken)
						.queryParam("documentType", "A44")  // Day-ahead prices
						.queryParam("in_Domain", "10YFI-1--------U")  // Finland
						.queryParam("out_Domain", "10YFI-1--------U")
						.queryParam("periodStart", start)  // Format: yyyyMMddHHmm
						.queryParam("periodEnd", end)
						.build()
						.toUriString();
		
		String xmlData = webClient.get()
						.uri(uri)
						.accept(MediaType.APPLICATION_XML)
						.retrieve()
						.bodyToMono(String.class)
						.block();
		
		JSONObject jsonObject = XML.toJSONObject(xmlData);
		return jsonObject.toString(2);  // Pretty-printed JSON
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
	
	private List<TimePricePair> parseEntsoePrices(String json) {
		List<TimePricePair> timePricePairs = new ArrayList<>();
		JSONObject jsonObject = new JSONObject(json);
		
		try {
			JSONObject marketDocument = jsonObject.getJSONObject("Publication_MarketDocument");
			Object timeSeries = marketDocument.get("TimeSeries");
			
			if (timeSeries instanceof JSONArray) {
				JSONArray timeSeriesArray = (JSONArray) timeSeries;
				for (int i = 0; i < timeSeriesArray.length(); i++) {
					processTimeSeries(timeSeriesArray.getJSONObject(i), timePricePairs);
				}
			} else if (timeSeries instanceof JSONObject) {
				processTimeSeries((JSONObject) timeSeries, timePricePairs);
			}
		} catch (Exception e) {
			System.err.println("Error parsing ENTSO-E response. JSON was: " + json);
			e.printStackTrace();
		}
		return timePricePairs;
	}
	
	private void processTimeSeries(JSONObject timeSeries, List<TimePricePair> timePricePairs) {
		try {
			JSONObject period = timeSeries.getJSONObject("Period");
			
			// Try different possible time interval field names
			String startTime = tryGetTime(period,
																		"timeInterval.start",
																		"start",
																		"start_DateAndTime",
																		"period.timeInterval.start"
			);
			
			if (startTime == null) {
				System.err.println("Could not find start time in period: " + period);
				return;
			}
			
			JSONArray points = period.getJSONArray("Point");
			DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;
			
			ZonedDateTime baseTime;
			try {
				baseTime = ZonedDateTime.parse(startTime, formatter);
			} catch (Exception e) {
				// Fallback to local date time if timezone parsing fails
				LocalDateTime localDateTime = LocalDateTime.parse(startTime, formatter);
				baseTime = localDateTime.atZone(ZoneId.of("Europe/Helsinki"));
			}
			
			for (int j = 0; j < points.length(); j++) {
				JSONObject point = points.getJSONObject(j);
				int position = point.getInt("position");
				double price = point.getDouble("price.amount");
				
				ZonedDateTime pointTime = baseTime.plusHours(position - 1);
				
				String formattedTime = pointTime.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
				
				//€/MWh
				timePricePairs.add(new TimePricePair(formattedTime, price));
			}
		} catch (Exception e) {
			System.err.println("Error processing time series: " + e.getMessage());
			e.printStackTrace();
		}
	}
	
	private String tryGetTime(JSONObject period, String... possibleFieldNames) {
		for (String fieldName : possibleFieldNames) {
			try {
				// Try to navigate through nested objects if field contains dots
				String[] path = fieldName.split("\\.");
				JSONObject current = period;
				
				for (int i = 0; i < path.length - 1; i++) {
					current = current.getJSONObject(path[i]);
				}
				
				return current.getString(path[path.length - 1]);
			} catch (Exception e) {
				// Field not found, try next one
				continue;
			}
		}
		return null;
	}
	
}
