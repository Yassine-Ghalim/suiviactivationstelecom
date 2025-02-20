package net.yassine.auth_service.Controller;

import net.yassine.auth_service.Entity.User;
import net.yassine.auth_service.Service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // ✅ Endpoint pour valider un utilisateur (login)
    @PostMapping("/validate")
    public ResponseEntity<?> validateUser(@RequestParam String username, @RequestParam String password) {
        try {
            User user = userService.validateUser(username, password);
            return ResponseEntity.ok(user);
        } catch (UsernameNotFoundException e) {
            return ResponseEntity.badRequest().body("Invalid credentials");
        }
    }

    // ✅ Endpoint pour créer un nouvel utilisateur (inscription)
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        User createdUser = userService.createUser(user);
        return ResponseEntity.ok(createdUser);
    }

    // ✅ Endpoint pour récupérer tous les utilisateurs (Admin Panel)
    @GetMapping("/all")
    public ResponseEntity<List<User>> getListUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    // ✅ Endpoint pour récupérer un utilisateur par ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable String id) {
        try {
            User user = userService.getUserById(id)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));
            return ResponseEntity.ok(user);
        } catch (UsernameNotFoundException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }




    // ✅ Endpoint pour mettre à jour un utilisateur
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody User user) {
        try {
            User updatedUser = userService.updateUser(id, user);
            return ResponseEntity.ok(updatedUser);
        } catch (UsernameNotFoundException e) {
            return ResponseEntity.badRequest().body("User not found");
        }
    }

    // ✅ Endpoint pour supprimer un utilisateur
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully");
    }


    @PostMapping("/{userId}/roles/{roleId}")
    public ResponseEntity<User> assignRole(@PathVariable String userId, @PathVariable String roleId) {
        User user = userService.assignRoleToUser(userId, roleId);
        return ResponseEntity.ok(user);
    }
}