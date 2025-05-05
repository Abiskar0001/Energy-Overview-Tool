package com.fingrid.fingrid.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {
	@Bean
	public WebClient webClient(WebClient.Builder builder) {
		return builder.build(); // You can add default headers or baseUrl here if needed
	}
}
