package org.usyj.makgora;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableAsync
@EnableScheduling
public class MakgoraApplication {

	public static void main(String[] args) {
		SpringApplication.run(MakgoraApplication.class, args);
	}

}
 