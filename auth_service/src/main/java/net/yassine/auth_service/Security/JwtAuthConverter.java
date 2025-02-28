package net.yassine.auth_service.Security;

import net.yassine.auth_service.Entity.Privilege;
import net.yassine.auth_service.Entity.User;
import net.yassine.auth_service.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Component
public class JwtAuthConverter implements Converter<Jwt, AbstractAuthenticationToken> {
    private final JwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
    private final UserService userService;

    @Autowired
    public JwtAuthConverter(UserService userService) {
        this.userService = userService;
    }

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        // Extract default authorities from the JWT token
        Collection<GrantedAuthority> authorities = new ArrayList<>(jwtGrantedAuthoritiesConverter.convert(jwt));

        // Fetch privileges from the database and add them as authorities
        String keycloakUserId = jwt.getSubject(); // Assuming the subject is the Keycloak user ID
        User user = userService.findByKeycloakUserId(keycloakUserId);
        if (user != null) {
            List<Privilege> privileges = user.getRoles().stream()
                    .flatMap(role -> role.getPrivileges().stream())
                    .distinct()
                    .collect(Collectors.toList());

            // Map privileges to authorities
            privileges.forEach(privilege -> authorities.add(new SimpleGrantedAuthority(privilege.name())));
        }

        return new JwtAuthenticationToken(jwt, authorities, jwt.getClaim("preferred_username"));
    }
}