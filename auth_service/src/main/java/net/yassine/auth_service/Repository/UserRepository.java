package net.yassine.auth_service.Repository;

import net.yassine.auth_service.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);
    Optional<User> findByEmail(String email);  // Ajout de cette ligne
    boolean existsByEmail(String email);
    Optional<User> findByKeycloakUserId(String keycloakUserId);
}
