package com.fingrid.fingrid.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class DataPointForecast {
	@JsonProperty("startTime")
	private String startTime;
	
	@JsonProperty("endTime")
	private String endTime;
	
	@JsonProperty("Electricity consumption forecast - next 24 hours")
	private String consumptionForecast;
}
