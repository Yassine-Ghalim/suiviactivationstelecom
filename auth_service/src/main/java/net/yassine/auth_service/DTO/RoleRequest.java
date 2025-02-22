package net.yassine.auth_service.DTO;

import lombok.Getter;
import lombok.Setter;
import net.yassine.auth_service.Entity.Privilege;

import java.util.Set;

@Getter
@Setter
public class RoleRequest {
    private String role;
    private String description;
    private Set<Privilege> privileges;
}
