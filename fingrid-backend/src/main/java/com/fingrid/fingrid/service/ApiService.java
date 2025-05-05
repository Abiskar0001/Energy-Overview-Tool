package com.fingrid.fingrid.service;

import com.fingrid.fingrid.response.FingridResponse;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@AllArgsConstructor
public class ApiService {
	@Value("${fingrid.apiKey}")
	private String apiKey;
	
	@Value("${fingrid.baseUrl}")
	private String baseUrl;
	
	private final WebClient webClient;
	
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
