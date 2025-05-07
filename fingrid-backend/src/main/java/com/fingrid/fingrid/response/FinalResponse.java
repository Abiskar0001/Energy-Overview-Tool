package com.fingrid.fingrid.response;

import lombok.Data;
import org.springframework.stereotype.Component;

import java.util.List;

@Data
@Component
public class FinalResponse {
	private Float latestElectricityConsumption;
	private Float latestElectricityProduction;
	private Float latestWindPowerproduction;
	private Float estimatedConsumptionAtTheTime;
	private List<FinalDataPoint> data;
}
