package net.yassine.auth_service.Security;

import net.yassine.auth_service.Entity.User;
import net.yassine.auth_service.Service.UserService;
import org.springframework.security.access.PermissionEvaluator;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.io.Serializable;
import java.util.Optional;
import java.util.UUID;

@Component
public class CustomPermissionEvaluator implements PermissionEvaluator {

    private final UserService userService;

    public CustomPermissionEvaluator(UserService userService) {
        this.userService = userService;
    }

    private boolean isValidKeycloakUserIdFormat(String keycloakUserId) {
        try {
            // Try to parse the keycloakUserId as a UUID
            UUID.fromString(keycloakUserId);
            return true;  // If successful, the format is valid
        } catch (IllegalArgumentException e) {
            // If an IllegalArgumentException is thrown, the format is invalid
            return false;
        }
    }

    @Override
    public boolean hasPermission(Authentication authentication, Object targetDomainObject, Object permission) {
        if (authentication == null || permission == null) {
            return false;
        }

        // Retrieve Keycloak User ID from JWT
        Jwt jwt = (Jwt) authentication.getPrincipal();
        String keycloakUserId = jwt.getSubject(); // 'sub' claim from JWT is the Keycloak User ID

        if (keycloakUserId == null || !isValidKeycloakUserIdFormat(keycloakUserId)) {
            throw new IllegalArgumentException("Invalid Keycloak user ID format");
        }

        Optional<User> userOptional = userService.findByKeycloakUserId(keycloakUserId);

        if (!userOptional.isPresent()) {
            return false;
        }

        User user = userOptional.get();
        String permissionString = permission.toString(); // Convert permission to string

        return user.getRoles().stream()
                .flatMap(role -> role.getPrivileges().stream())
                .anyMatch(priv -> priv.name().equals(permissionString)); // Check if any privilege matches
    }

    @Override
    public boolean hasPermission(Authentication authentication, Serializable targetId, String targetType, Object permission) {
        return hasPermission(authentication, targetType, permission);
    }
}
