package com.fingrid.fingrid.response;

import lombok.Data;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
@Data
@Component
public class FinalDataPoint {
	private OffsetDateTime startTime;
	private OffsetDateTime endTime;
	private float electricityConsumption;
	private float electricityProduction;
	private float windPowerProduction;
	private float forecastedElectricityPrice;
}
