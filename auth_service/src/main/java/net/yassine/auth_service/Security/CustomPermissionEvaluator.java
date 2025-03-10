package net.yassine.auth_service.Security;

import net.yassine.auth_service.Entity.User;
import net.yassine.auth_service.Service.UserService;
import org.springframework.security.access.PermissionEvaluator;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
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
        Jwt jwt = (Jwt) authentication.getPrincipal();  // Retrieve the Jwt object
        String keycloakUserId = jwt.getSubject();  // The 'sub' claim is usually the Keycloak User ID

        // If keycloakUserId is not a valid UUID, handle the error gracefully
        if (keycloakUserId == null || !isValidKeycloakUserIdFormat(keycloakUserId)) {
            throw new IllegalArgumentException("Invalid Keycloak user ID format");
        }

        // Retrieve the user using the Keycloak User ID
        Optional<User> userOptional = userService.findByKeycloakUserId(keycloakUserId);

        // Check if the user exists
        if (!userOptional.isPresent()) {
            return false;  // If the user is not found, return false
        }

        // Retrieve the user
        User user = userOptional.get();

        // Check if the user has the requested permission
        return user.getRoles().stream()
                .flatMap(role -> role.getPrivileges().stream())  // Flatten role privileges
                .anyMatch(priv -> priv.name().equals(permission.toString()));  // Check if any privilege matches the requested permission
    }

    @Override
    public boolean hasPermission(Authentication authentication, Serializable targetId, String targetType, Object permission) {
        return hasPermission(authentication, targetType, permission);
    }
}
