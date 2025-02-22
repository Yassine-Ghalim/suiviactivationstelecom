import { Component } from '@angular/core';
import {User} from '../../models/user';
import {Role} from '../../models/role';
import {Privilege} from '../../models/privilege';
import {Router} from '@angular/router';
import {UserService} from '../../service/user.service';
import {RoleService} from '../../service/role.service';
import {AuthService} from '../../service/auth.service';
import {FormsModule} from '@angular/forms';
import {NgClass, NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-usermanagement',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    NgIf,
    NgClass
  ],
  templateUrl: './usermanagement.component.html',
  styleUrl: './usermanagement.component.css'
})

export class UsermanagementComponent {
  currentUserId: string | null = null; // To store current user ID

  users: User[] = [];
  roles: Role[] = [];
  privileges: Privilege[] = Object.values(Privilege);
  selectedUserId: string = '';
  selectedRoleId: string = '';

  showUserForm: boolean = false; // Pour afficher le formulaire de l'utilisateur
  showRoleForm: boolean = false; // Pour afficher le formulaire du rôle
  userForm: User = {
    id: '',
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    enabled: true,
    emailVerified: false,
    roles: []
  };
  // Formulaire utilisateur

  roleForm: Role = {
    id: '',
    role: '',
    description: '',
    privileges: [] // Doit être un tableau de strings
  };



  userToEdit: User | null = null; // Pour savoir si on édite un utilisateur
  roleToEdit: Role | null = null; // Pour savoir si on édite un rôle

  constructor(  private router: Router, private userService: UserService, private roleService: RoleService,private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
    this.currentUserId = localStorage.getItem('currentUserId');
    this.checkPrivileges();
    if (!this.currentUserId) {
      this.router.navigate(['/403']); // Redirige vers une page 403
      return; // Arrête l'exécution du reste du code
    }


  }



  createUser() {
    this.userService.createUser(this.userForm).subscribe(() => {
      this.loadUsers();
      this.showUserForm = false; // Fermer le formulaire
    });
  }

  updateUser() {
    if (this.userToEdit) {
      // Mise à jour de l'utilisateur avec les données de userToEdit
      this.userService.updateUser(this.userToEdit.id, this.userForm).subscribe(() => {
        this.loadUsers();
        this.showUserForm = false; // Fermer le formulaire
      });
    }
  }

  cancelEditing() {
    this.userToEdit = null;  // Réinitialise l'utilisateur à modifier
    this.showUserForm = false;  // Cache le formulaire
  }

  createRole() {
    this.roleService.createRole(this.roleForm).subscribe(() => {
      this.loadRoles();
      this.showRoleForm = false; // Fermer le formulaire
    });
  }

  updateRole() {
    if (this.roleToEdit) {
      this.roleService.updateRole(this.roleToEdit.id, this.roleForm).subscribe(() => {
        this.loadRoles();
        this.showRoleForm = false; // Fermer le formulaire
      });
    }
  }

  editUser(user: User) {
    this.userToEdit = user;
    this.userForm = { ...user }; // Remplir le formulaire avec les données de l'utilisateur
    this.showUserForm = true;
  }

  editRole(role: Role) {
    this.roleToEdit = role;
    this.roleForm = { ...role }; // Remplir le formulaire avec les données du rôle
    this.showRoleForm = true;
  }

  clearForm() {
    this.userForm = { id: '',
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      enabled: true,
      emailVerified: false,
      roles: []
    };
    this.roleForm = {id:'', role: '', description: '', privileges: []  };
    this.userToEdit = null;
    this.roleToEdit = null;
  }
// Gestion de la sélection des privilèges
  togglePrivilege(privilege: Privilege) {
    const index = this.roleForm.privileges.indexOf(privilege);
    if (index > -1) {
      this.roleForm.privileges.splice(index, 1); // Supprime si déjà sélectionné
    } else {
      this.roleForm.privileges.push(privilege); // Ajoute si non sélectionné
    }
  }

  deleteUser(userId: string): void {
    this.userService.deleteUser(userId).subscribe(
      (response) => {
        console.log('Utilisateur supprimé avec succès');
        // Traiter la réponse si nécessaire
        this.loadUsers();  // Rafraîchir la liste des utilisateurs
      },
      (error) => {
        console.error('Erreur lors de la suppression de l\'utilisateur', error);
        // Afficher un message plus utile pour l'utilisateur
        alert('Une erreur est survenue lors de la suppression de l\'utilisateur.');
      }
    );
  }



  deleteRole(id: string) {
    this.roleService.deleteRole(id).subscribe({
      next: () => {
        console.log(`Rôle avec l'ID ${id} supprimé avec succès.`);
        this.loadRoles(); // Rafraîchir la liste après suppression
      },
      error: (err) => {
        console.error(`Erreur lors de la suppression du rôle avec l'ID ${id} :`, err);
        alert("❌ Impossible de supprimer ce rôle, des utilisateurs y sont encore assignés !");
      }
    });
  }


  // Charger les utilisateurs depuis le service
  loadUsers() {
    this.userService.getAllUsers().subscribe(data => {
      this.users = data;
    });
  }

  // Charger les rôles depuis le service
  loadRoles() {
    this.roleService.getAllRoles().subscribe(data => {
      this.roles = data;
    });
  }

  assignRoleToUser() {
    if (!this.selectedUserId || !this.selectedRoleId) {
      alert('Veuillez sélectionner un utilisateur et un rôle.');
      return;
    }

    this.userService.assignRoleToUser(this.selectedUserId, this.selectedRoleId).subscribe(
      () => {
        alert('Rôle assigné avec succès.');
        this.loadUsers();  // Recharger la liste des utilisateurs
      },
      error => {
        console.error("Erreur lors de l'assignation du rôle", error);
      }
    );
  }

  // Assigner un rôle à un utilisateur
  /*assignRoleToUser() {
    if (!this.selectedUserId || !this.selectedRoleId) {
      alert('Veuillez sélectionner un utilisateur et un rôle.');
      return;
    }

    const user = this.users.find(u => u.id === this.selectedUserId);
    const role = this.roles.find(r => r.id === this.selectedRoleId);

    if (user && role) {
      user.roles.push(role); // Ajouter le rôle à l'utilisateur

      this.userService.updateUser(user.id, user).subscribe(() => {
        alert('Rôle assigné avec succès.');
        this.loadUsers();  // Recharger la liste des utilisateurs
      }, error => {
        console.error('Erreur lors de l\'assignation du rôle', error);
      });
    }
  }*/

  // Supprimer un rôle de l'utilisateur
  removeRoleFromUser(role: Role) {
    if (!this.selectedUserId || !this.selectedRoleId) {
      alert('Veuillez sélectionner un utilisateur et un rôle.');
      return;
    }

    const user = this.users.find(u => u.id === this.selectedUserId);
    if (user) {
      const roleIndex = user.roles.findIndex(r => r.id === this.selectedRoleId);
      if (roleIndex !== -1) {
        user.roles.splice(roleIndex, 1); // Supprimer le rôle de l'utilisateur

        this.userService.updateUser(user.id, user).subscribe(() => {
          alert('Rôle supprimé avec succès.');
          this.loadUsers();  // Recharger la liste des utilisateurs
        }, error => {
          console.error('Erreur lors de la suppression du rôle', error);
        });
      }
    }
  }
  canCreateUser: boolean = false;
  canCreateRole: boolean = false;
  canViewUser: boolean = false;
  canEditUser: boolean = false;
  canDeleteUser: boolean = false;
  canViewRole: boolean = false;
  canEditRole: boolean = false;
  canDeleteRole: boolean = false;
  // Vérifier les privilèges de l'utilisateur pour afficher des sections spécifiques
  checkPrivileges(): void {
    this.authService.hasPrivilege(Privilege.USER_CREATE).subscribe(canCreateUser => {
      this.canCreateUser = canCreateUser;
    });

    this.authService.hasPrivilege(Privilege.ROLE_CREATE).subscribe(canCreateRole => {
      this.canCreateRole = canCreateRole;
    });

    // Vérification des privilèges pour les utilisateurs
    this.authService.hasPrivilege(Privilege.USER_VIEW).subscribe(canViewUser => {
      this.canViewUser = canViewUser;
    });

    this.authService.hasPrivilege(Privilege.USER_EDIT).subscribe(canEditUser => {
      this.canEditUser = canEditUser;
    });

    this.authService.hasPrivilege(Privilege.USER_DELETE).subscribe(canDeleteUser => {
      this.canDeleteUser = canDeleteUser;
    });

    // Vérification des privilèges pour les rôles
    this.authService.hasPrivilege(Privilege.ROLE_VIEW).subscribe(canViewRole => {
      this.canViewRole = canViewRole;
    });

    this.authService.hasPrivilege(Privilege.ROLE_EDIT).subscribe(canEditRole => {
      this.canEditRole = canEditRole;
    });

    this.authService.hasPrivilege(Privilege.ROLE_DELETE).subscribe(canDeleteRole => {
      this.canDeleteRole = canDeleteRole;
    });
  }
}
