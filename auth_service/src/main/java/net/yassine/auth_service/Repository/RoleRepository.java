package net.yassine.auth_service.Repository;

import net.yassine.auth_service.Entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, String> {
    Role findByRole(String role);
}
