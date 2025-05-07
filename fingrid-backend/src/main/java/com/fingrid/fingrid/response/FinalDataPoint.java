package com.fingrid.fingrid.response;

import lombok.Data;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
@Data
@Component
public class FinalDataPoint {
	private OffsetDateTime startTime;
	private OffsetDateTime endTime;
	private Float electricityConsumption;
	private Float electricityProduction;
	private Float windPowerProduction;
}
