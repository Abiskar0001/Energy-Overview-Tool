package com.fingrid.fingrid.response;

import lombok.Data;
import org.springframework.stereotype.Component;

import java.util.List;

@Data
@Component
public class FinalResponse {
	private int latestElectricityConsumption;
	private int latestElectricityProduction;
	private int latestWindPowerproduction;
	private int latestForecastedElectricityPrice;
	private List<FinalDataPoint> data;
}
