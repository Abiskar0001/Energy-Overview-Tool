package com.fingrid.fingrid.controller;

import com.fingrid.fingrid.response.FinalResponse;
import com.fingrid.fingrid.service.ApiService;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ApiController {
	private final ApiService apiService;
	
	@GetMapping("/api/final")
	public FinalResponse getFinalDataPoint(){
		return apiService.fetchAndMapData();
	}
}
