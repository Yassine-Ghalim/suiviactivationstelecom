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
        // Extraire les autorités par défaut du token JWT
        Collection<GrantedAuthority> authorities = new ArrayList<>(jwtGrantedAuthoritiesConverter.convert(jwt));

        // Récupérer l'ID utilisateur Keycloak (supposé être dans le sujet du JWT)
        String keycloakUserId = jwt.getSubject();
        Optional<User> userOptional = userService.findByKeycloakUserId(keycloakUserId);

        // Vérifier si l'utilisateur existe
        if (userOptional.isPresent()) {
            User user = userOptional.get();

            // Extraire les privilèges des rôles de l'utilisateur (en s'assurant que les rôles et privilèges ne sont pas null)
            Set<Privilege> privileges = user.getRoles().stream()
                    .filter(Objects::nonNull)  // Assurer que le rôle n'est pas null
                    .flatMap(role -> Optional.ofNullable(role.getPrivileges()).orElse(Collections.emptySet()).stream())  // Assurer que les privilèges ne sont pas null, et les convertir en flux
                    .collect(Collectors.toSet());  // Utiliser un Set pour éviter les doublons

            // Ajouter chaque privilège comme autorité
            privileges.forEach(privilege -> authorities.add(new SimpleGrantedAuthority(privilege.name())));
        }

        // Créer et retourner un JwtAuthenticationToken avec les autorités et le nom d'utilisateur
        return new JwtAuthenticationToken(jwt, authorities, jwt.getClaim("preferred_username"));
    }

}