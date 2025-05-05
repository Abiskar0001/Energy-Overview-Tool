package com.fingrid.fingrid.response;

import lombok.Data;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
@Data
@Component
public class FinalDataPoint {
	private OffsetDateTime startTime;
	private OffsetDateTime endTime;
	private int ElectricityConsumption;
	private int ElectricityProduction;
	private int WindPowerproduction;
	private int ForecastedElectricityPrice;
}
