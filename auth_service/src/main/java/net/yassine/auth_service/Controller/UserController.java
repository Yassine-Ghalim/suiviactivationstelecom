package net.yassine.auth_service.Controller;

import net.yassine.auth_service.Entity.Privilege;
import net.yassine.auth_service.Entity.User;
import net.yassine.auth_service.Service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }


    // Endpoint pour créer un nouvel utilisateur (inscription)
    @PostMapping("/register")
    @PreAuthorize("hasAuthority('USER_VIEW')")
    public ResponseEntity<Map<String, String>> registerUser(@RequestBody User user) {
        try {
            String token = userService.registerUser(user);
            // Retourner un objet JSON au lieu d'une simple chaîne de caractères
            Map<String, String> response = new HashMap<>();
            response.put("message", "Utilisateur enregistré avec succès");
            response.put("token", token);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();

            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Erreur: " + e.getMessage());

            return ResponseEntity.badRequest().body(errorResponse);
        }
    }


    //Endpoint pour récupérer tous les utilisateurs (Admin Panel)
    @GetMapping("/all")
    @PreAuthorize("hasAuthority('USER_VIEW')")
    public ResponseEntity<List<User>> getListUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    //Endpoint pour récupérer un utilisateur par ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_VIEW')")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            User user = userService.getUserById(id)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));
            return ResponseEntity.ok(user);
        } catch (UsernameNotFoundException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }




    //Endpoint pour mettre à jour un utilisateur
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_VIEW')")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        try {
            // Appeler la méthode updateUser du service
            User updated = userService.updateUser(id, updatedUser);

            // Retourner la réponse avec le status HTTP 200 et l'utilisateur mis à jour
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            // En cas d'erreur, retourner une réponse appropriée avec un message d'erreur
            if (e.getMessage().contains("User not found")) {
                // Si l'utilisateur n'est pas trouvé, retourner une erreur 404
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User not found with ID: " + id);
            } else if (e.getMessage().contains("Keycloak")) {
                // Si l'erreur vient de Keycloak, retourner une erreur 500
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Error updating user in Keycloak: " + e.getMessage());
            } else {
                // Pour les autres erreurs, retourner une erreur 400
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Error updating user: " + e.getMessage());
            }
        }
    }

    //Endpoint pour supprimer un utilisateur
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_VIEW')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }


    @PostMapping("/{userId}/roles/{roleId}")
    @PreAuthorize("hasAuthority('USER_VIEW')")
    public ResponseEntity<User> assignRole(@PathVariable Long userId, @PathVariable Long roleId) {
        User user = userService.assignRoleToUser(userId, roleId);
        return ResponseEntity.ok(user);
    }



    @GetMapping("/privileges/{keycloakUserId}")
    @PreAuthorize("hasAuthority('USER_VIEW')")
    public ResponseEntity<List<Privilege>> getUserPrivileges(@PathVariable String keycloakUserId) {
        User user = userService.findByKeycloakUserId(keycloakUserId);  // Utilise le Keycloak ID
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        List<Privilege> privileges = user.getRoles().stream()
                .flatMap(role -> role.getPrivileges().stream())
                .distinct()
                .collect(Collectors.toList());

        return ResponseEntity.ok(privileges);
    }


}