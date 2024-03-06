package org.example.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import static org.springframework.security.config.Customizer.withDefaults;


/**
 * 权限验证配置
 * Register the security policy
 *
 * @author lvyongjie
 * @created 26/06/2023
 */

@Configuration
@EnableWebSecurity  // enable Spring Security's web security support.
@RequiredArgsConstructor
@EnableMethodSecurity
public class WebSecurityConfig{

    private final JWTAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;


    @Bean
    public SecurityFilterChain securityFilterChain (HttpSecurity http) throws Exception {

        http
                // config CORS and CSRF
                .cors(withDefaults())             // by default uses a Bean by the name of corsConfigurationSource
                .csrf(csrf -> csrf.disable())     // disable csrf - Allow POST/PUT/etc request

                // config the server to be stateless (authenticate every request via a token and do not require a session to keep the user context)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // config the security policy for API
                .authorizeRequests(authorize -> authorize
                        // Allow public access to swagger
                        .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**", "/webjars/**").permitAll()
                        // Allow public access to certain endpoint
                        .requestMatchers("/user/**", "/attraction/**").permitAll()
                        // Require authentication for all other requests
                        .anyRequest().authenticated())
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();

    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000","http://18.201.43.160", "https://csi6220-2-vm1.ucd.ie","http://localhost","http://localhost:80","https://localhost:80","https://localhost:3000" ));
        configuration.setAllowedMethods(Arrays.asList("GET","POST","OPTIONS"));
        //Allow all request header fields
        configuration.setAllowedHeaders(Arrays.asList("*"));
        //Allowed to carry credentials, if allowed to carry credentials, setAllowedOrigins may not be set to *.
       configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
   
}
