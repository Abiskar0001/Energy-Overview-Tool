package com.fingrid.fingrid.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebClientConfig {
	@Bean
	public WebClient webClient(WebClient.Builder builder) {
		WebClient webClient = WebClient.builder()
						.codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(10 * 1024 * 1024)) // 10 MB
						.build();
		return webClient;
	}
	
	@Bean
	public WebMvcConfigurer corsConfigurer() {
		return new WebMvcConfigurer() {
			@Override
			public void addCorsMappings(CorsRegistry registry) {
				registry.addMapping("/**")
								.allowedOrigins("http://localhost:5173")
								.allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
								.allowedHeaders("*");
			}
		};
	}
}
