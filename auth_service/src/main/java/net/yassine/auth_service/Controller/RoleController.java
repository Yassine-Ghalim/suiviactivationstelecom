package net.yassine.auth_service.Controller;

import net.yassine.auth_service.DTO.RoleRequest;
import net.yassine.auth_service.Entity.Privilege;
import net.yassine.auth_service.Entity.Role;
import net.yassine.auth_service.Service.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
public class RoleController {

    @Autowired
    private RoleService roleService;

    @GetMapping
    public List<Role> getAllRoles() {
        return roleService.getAllRoles();
    }

    @GetMapping("/{id}")
    public Role getRoleById(@PathVariable String id) {
        return roleService.getRoleById(id);
    }

    @PostMapping
    public ResponseEntity<Role>  createRole(@RequestBody RoleRequest request) {
        Role role = roleService.createRole(request.getRoleName(), request.getDescription(), request.getPrivileges());
        return ResponseEntity.status(HttpStatus.CREATED).body(role);
    }

    @PutMapping("/{id}")
    public Role updateRole(@PathVariable String id, @RequestBody Role roleDetails) {
        return roleService.updateRole(id, roleDetails);
    }

    @DeleteMapping("/{id}")
    public void deleteRole(@PathVariable String id) {
        roleService.deleteRole(id);
    }


    private boolean hasPrivilege(String userId, Privilege privilege) {
        // Récupérer les privilèges de l'utilisateur en fonction de son role
        List<Privilege> privileges = roleService.getPrivilegesForUser(userId);

        // Vérifier si l'utilisateur a le privilège spécifié
        return privileges.contains(privilege);
    }

}