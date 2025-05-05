package com.fingrid.fingrid.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.stereotype.Component;

import java.util.List;

@Data
@Component
public class FingridResponse {
	@JsonProperty("data")
	private List<Datapoint> data;
}
