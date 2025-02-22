package net.yassine.auth_service.Service;

import net.yassine.auth_service.Entity.Privilege;
import net.yassine.auth_service.Entity.Role;
import net.yassine.auth_service.Repository.RoleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class RoleService {

    private final RoleRepository roleRepository;

    public RoleService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    /**
     * Récupère tous les rôles
     */
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    /**
     * Récupère un rôle par son ID
     */
    public Role getRoleById(String id) {
        return roleRepository.findById(id).orElse(null);
    }

    /**
     * Crée un rôle avec une liste de privilèges
     */
    @Transactional
    public Role createRole(String roleName, String description, Set<Privilege> privileges) {
        Role role = new Role();
        role.setRole(roleName);
        role.setDescription(description);
        role.setPrivileges(privileges);
        return roleRepository.save(role);
    }

    /**
     * Met à jour un rôle existant
     */
    public Role updateRole(String id, Role roleDetails) {
        Role role = roleRepository.findById(id).orElse(null);
        if (role != null) {
            role.setRole(roleDetails.getRole());
            role.setDescription(roleDetails.getDescription());
            role.setPrivileges(roleDetails.getPrivileges());
            return roleRepository.save(role);
        }
        return null;
    }

    /**
     * Supprime un rôle par son ID
     */
    public void deleteRole(String id) {
        roleRepository.deleteById(id);
    }



}
