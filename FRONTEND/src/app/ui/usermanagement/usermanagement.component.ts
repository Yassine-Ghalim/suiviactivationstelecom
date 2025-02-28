import { Component } from '@angular/core';
import { User } from '../../models/user';
import { Role } from '../../models/role';
import { Privilege } from '../../models/privilege';
import { Router } from '@angular/router';
import { UserService } from '../../service/user.service';
import { RoleService } from '../../service/role.service';
import { AuthService } from '../../service/auth.service';
import { FormsModule } from '@angular/forms';
import { NgClass, NgForOf, NgIf } from '@angular/common';

@Component({
  selector: 'app-usermanagement',
  standalone: true,
  imports: [FormsModule, NgForOf, NgIf, NgClass],
  templateUrl: './usermanagement.component.html',
  styleUrl: './usermanagement.component.css',
})
export class UsermanagementComponent {
  currentUserId: number | null = null; // To store current user ID

  users: User[] = [];
  roles: Role[] = [];
  privileges: Privilege[] = Object.values(Privilege);
  selectedUserId: number | null | undefined = null;
  selectedRoleId: number | null = null;

  showUserForm: boolean = false; // Pour afficher le formulaire de l'utilisateur
  showRoleForm: boolean = false; // Pour afficher le formulaire du rôle
  userForm: User = {
    id: 0,
    keycloak_user_id: '',
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    enabled: true,
    emailVerified: false,
    roles: [], // Add roles if needed, e.g. ['USER'] for a default role
  };
  // Formulaire utilisateur

  roleForm: Role = {
    id: 0,
    role: '',
    description: '',
    privileges: [], // Doit être un tableau de strings
  };

  userToEdit: User | null = null; // Pour savoir si on édite un utilisateur
  roleToEdit: Role | null = null; // Pour savoir si on édite un rôle

  constructor(
    private router: Router,
    private userService: UserService,
    private roleService: RoleService,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    this.currentUserId = Number(localStorage.getItem('currentUserId'));
    await this.loadUsers();
    await this.loadRoles();
  }

  // Créer un nouvel utilisateur
  async createUser() {
    // Exclure l'ID avant d'envoyer les données
    const userToCreate = { ...this.userForm };
    delete userToCreate.id; // Supprimer l'ID s'il existe dans le formulaire

    try {
      const response$ = await this.userService.createUser(userToCreate);
      response$.subscribe({
        next: () => {
          this.loadUsers(); // Recharger la liste des utilisateurs
          this.showUserForm = false; // Fermer le formulaire
        },
        error: (error: any) => {
          console.error('Erreur lors de la création de l\'utilisateur:', error);
        },
      });
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
    }
  }

  // Mettre à jour un utilisateur
  async updateUser() {
    if (this.userToEdit && this.userToEdit.id !== null) {
      try {
        const response$ = await this.userService.updateUser(this.userToEdit.id, this.userForm);
        response$.subscribe({
          next: () => {
            this.loadUsers();
            this.showUserForm = false; // Fermer le formulaire
          },
          error: (error: any) => {
            console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
          },
        });
      } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      }
    } else {
      alert('L\'ID de l\'utilisateur est invalide.');
    }
  }

  // Créer un nouveau rôle
  async createRole() {
    try {
      const response$ = await this.roleService.createRole(this.roleForm);
      response$.subscribe({
        next: () => {
          this.loadRoles();
          this.showRoleForm = false; // Fermer le formulaire
        },
        error: (error: any) => {
          console.error('Erreur lors de la création du rôle:', error);
        },
      });
    } catch (error) {
      console.error('Erreur lors de la création du rôle:', error);
    }
  }

  // Mettre à jour un rôle
  async updateRole() {
    if (this.roleToEdit && this.roleToEdit.id) {
      try {
        const response$ = await this.roleService.updateRole(this.roleToEdit.id, this.roleForm);
        response$.subscribe({
          next: () => {
            this.loadRoles();
            this.showRoleForm = false; // Fermer le formulaire
          },
          error: (error: any) => {
            console.error('Erreur lors de la mise à jour du rôle:', error);
          },
        });
      } catch (error) {
        console.error('Erreur lors de la mise à jour du rôle:', error);
      }
    }
  }

  // Supprimer un rôle
  async deleteRole(id: number | null) {
    if (id !== null) {
      try {
        const response$ = await this.roleService.deleteRole(id);
        response$.subscribe({
          next: () => {
            console.log(`Rôle avec l'ID ${id} supprimé avec succès.`);
            this.loadRoles(); // Rafraîchir la liste après suppression
          },
          error: (err) => {
            console.error(`Erreur lors de la suppression du rôle avec l'ID ${id} :`, err);
            alert("❌ Impossible de supprimer ce rôle, des utilisateurs y sont encore assignés !");
          },
        });
      } catch (error) {
        console.error('Erreur lors de la suppression du rôle:', error);
      }
    }
  }

  // Charger les utilisateurs depuis le service
  async loadUsers() {
    try {
      const users$ = await this.userService.getAllUsers();
      users$.subscribe({
        next: (data: User[]) => {
          console.log('Utilisateurs chargés avec succès :', data);
          this.users = data;
        },
        error: (error: any) => {
          console.error('Erreur lors du chargement des utilisateurs :', error);
          if (error.status === 401) {
            console.error('Non autorisé : Veuillez vous reconnecter.');
            this.router.navigate(['/login']); // Redirect to login page
          } else if (error.status === 403) {
            console.error('Accès refusé : Vous n\'avez pas les permissions nécessaires.');
            alert('Accès refusé : Vous n\'avez pas les permissions nécessaires.');
          } else {
            console.error('Une erreur inattendue s\'est produite :', error.message);
            alert('Une erreur inattendue s\'est produite. Veuillez réessayer plus tard.');
          }
        },
        complete: () => {
          console.log('Chargement des utilisateurs terminé.');
        },
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs :', error);
    }
  }

  // Charger les rôles depuis le service
  async loadRoles() {
    try {
      const roles$ = await this.roleService.getAllRoles();
      roles$.subscribe({
        next: (data: Role[]) => {
          console.log('Rôles chargés avec succès :', data);
          this.roles = data;
        },
        error: (error: any) => {
          console.error('Erreur lors du chargement des rôles :', error);
          if (error.status === 401) {
            console.error('Non autorisé : Veuillez vous reconnecter.');
            this.router.navigate(['/login']); // Redirect to login page
          } else if (error.status === 403) {
            console.error('Accès refusé : Vous n\'avez pas les permissions nécessaires.');
            alert('Accès refusé : Vous n\'avez pas les permissions nécessaires.');
          } else {
            console.error('Une erreur inattendue s\'est produite :', error.message);
            alert('Une erreur inattendue s\'est produite. Veuillez réessayer plus tard.');
          }
        },
        complete: () => {
          console.log('Chargement des rôles terminé.');
        },
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des rôles :', error);
    }
  }

  // Assigner un rôle à un utilisateur
  async assignRoleToUser() {
    if (!this.selectedUserId || !this.selectedRoleId) {
      alert('Veuillez sélectionner un utilisateur et un rôle.');
      return;
    }

    try {
      const user$ = await this.userService.assignRoleToUser(this.selectedUserId, this.selectedRoleId);
      user$.subscribe({
        next: () => {
          alert('Rôle assigné avec succès.');
          this.loadUsers(); // Recharger la liste des utilisateurs
        },
        error: (error: any) => {
          console.error("Erreur lors de l'assignation du rôle", error);
          if (error.status === 401) {
            alert('Non autorisé : Veuillez vous reconnecter.');
          } else if (error.status === 403) {
            alert('Accès refusé : Vous n\'avez pas les permissions nécessaires.');
          } else {
            alert('Une erreur inattendue s\'est produite. Veuillez réessayer plus tard.');
          }
        },
      });
    } catch (error) {
      console.error("Erreur lors de l'assignation du rôle :", error);
    }
  }

  // Supprimer un utilisateur
  async deleteUser(userId: number|null| undefined ) {
    try {
      const response$ = await this.userService.deleteUser(userId);
      response$.subscribe({
        next: () => {
          alert('Utilisateur supprimé avec succès.');
          this.loadUsers(); // Recharger la liste des utilisateurs
        },
        error: (error: any) => {
          console.error("Erreur lors de la suppression de l'utilisateur :", error);
        },
      });
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur :", error);
    }
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

  // Annuler l'édition
  cancelEditing() {
    this.userToEdit = null; // Réinitialise l'utilisateur à modifier
    this.showUserForm = false; // Cache le formulaire
  }

  // Réinitialiser les formulaires
  clearForm() {
    this.userForm = {
      id: 0,
      keycloak_user_id: '',
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      enabled: true,
      emailVerified: false,
      roles: [],
    };
    this.roleForm = { id: 0, role: '', description: '', privileges: [] };
    this.userToEdit = null;
    this.roleToEdit = null;
  }

  // Éditer un utilisateur
  editUser(user: User) {
    this.userToEdit = user;
    this.userForm = { ...user }; // Remplir le formulaire avec les données de l'utilisateur
    this.showUserForm = true;
  }

  // Éditer un rôle
  editRole(role: Role) {
    this.roleToEdit = role;
    this.roleForm = { ...role }; // Remplir le formulaire avec les données du rôle
    this.showRoleForm = true;
  }
}
