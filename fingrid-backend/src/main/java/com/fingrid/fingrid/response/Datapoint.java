package com.fingrid.fingrid.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.stereotype.Component;

@Data
@Component
public class Datapoint {
	@JsonProperty("datasetId")
	private int datasetId;
	
	@JsonProperty("startTime")
	private String startTime;
	
	@JsonProperty("endTime")
	private String endTime;
	
	@JsonProperty("Electricity consumption in Finland - real time data")
	private float electricityConsumption;
	
	@JsonProperty("Electricity production in Finland - real time data")
	private float electricityProduction;
	
	@JsonProperty("Wind power production - real time data")
	private float windPowerProduction;
}
