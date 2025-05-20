package com.fingrid.fingrid.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@Data
public class TimePricePair {
	private String time;
	private double price;
}
