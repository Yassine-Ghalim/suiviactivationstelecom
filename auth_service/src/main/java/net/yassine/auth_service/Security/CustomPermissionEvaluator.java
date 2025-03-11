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
            UUID.fromString(keycloakUserId);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    @Override
    public boolean hasPermission(Authentication authentication, Object targetDomainObject, Object permission) {
        // This method is not used in your case, but you can delegate to the other method
        return hasPermission(authentication, null, targetDomainObject.toString(), permission);
    }

    @Override
    public boolean hasPermission(Authentication authentication, Serializable targetId, String targetType, Object permission) {
        if (authentication == null || permission == null || targetType == null) {
            return false;
        }

        // Retrieve Keycloak User ID from JWT
        Jwt jwt = (Jwt) authentication.getPrincipal();
        String keycloakUserId = jwt.getSubject();

        // Validate Keycloak User ID format
        if (keycloakUserId == null || !isValidKeycloakUserIdFormat(keycloakUserId)) {
            throw new IllegalArgumentException("Invalid Keycloak user ID format");
        }

        // Retrieve the user using the Keycloak User ID
        Optional<User> userOptional = userService.findByKeycloakUserId(keycloakUserId);

        // Check if the user exists
        if (!userOptional.isPresent()) {
            return false;
        }

        // Retrieve the user
        User user = userOptional.get();

        // Check if the user has the requested permission for the target type
        return user.getRoles().stream()
                .flatMap(role -> role.getPrivileges().stream())
                .anyMatch(priv -> priv.name().equals(targetType + "_" + permission.toString()));
    }
}