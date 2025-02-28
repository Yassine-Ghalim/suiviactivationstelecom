package net.yassine.auth_service.Service;

import com.sun.security.auth.UserPrincipal;
import net.yassine.auth_service.Entity.Privilege;
import net.yassine.auth_service.Entity.Role;
import net.yassine.auth_service.Entity.User;
import net.yassine.auth_service.Repository.RoleRepository;
import net.yassine.auth_service.Repository.UserRepository;
import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.representations.AccessTokenResponse;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.ws.rs.core.Response;
import java.util.*;
import java.util.stream.Collectors;


@Service
@Transactional
public class UserService  {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public UserService(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    @Value("${keycloak.auth-server-url}")
    private String keycloakServerUrl;

    @Value("${keycloak.realm}")
    private String realm;

    @Value("${keycloak.resource}")
    private String clientId;

    @Value("${keycloak.credentials.secret}")
    private String clientSecret;

    @Value("${keycloak.admin.username}")
    private String adminUsername;

    @Value("${keycloak.admin.password}")
    private String adminPassword;

    /**
     * Initialise une instance Keycloak pour l'admin
     */
    private Keycloak getKeycloakAdminInstance() {
        return KeycloakBuilder.builder()
                .serverUrl(keycloakServerUrl)
                .realm("bdcc-realm")
                .clientId("auth-service")
                .username(adminUsername)
                .password(adminPassword)
                .grantType(OAuth2Constants.PASSWORD)
                .build();
    }

    /**
     * Initialise une instance Keycloak pour un utilisateur normal
     */
    private Keycloak getKeycloakUserInstance(String username, String password) {
        return KeycloakBuilder.builder()
                .serverUrl(keycloakServerUrl)
                .realm(realm)
                .clientId(clientId)
                .clientSecret(clientSecret)
                .username(username)
                .password(password)
                .grantType(OAuth2Constants.PASSWORD)
                .build();
    }

    /**
     * Enregistre un nouvel utilisateur dans Keycloak et la base de données
     */
    // Méthode pour enregistrer un utilisateur dans Keycloak et dans la base de données
    public String registerUser(User user) {
        // Initialisation de l'instance Keycloak
        Keycloak keycloak = getKeycloakAdminInstance();

        // Créer la représentation de l'utilisateur pour Keycloak
        UserRepresentation userRep = new UserRepresentation();
        userRep.setUsername(user.getUsername());
        userRep.setEmail(user.getEmail());
        userRep.setFirstName(user.getFirstName());
        userRep.setLastName(user.getLastName());
        userRep.setEnabled(user.isEnabled());
        userRep.setEmailVerified(user.isEmailVerified());

        // Ajout du mot de passe
        CredentialRepresentation credentials = new CredentialRepresentation();
        credentials.setType(CredentialRepresentation.PASSWORD);
        credentials.setValue(user.getPassword()); // Le mot de passe saisi par l'utilisateur
        credentials.setTemporary(false); // Le mot de passe n'est pas temporaire
        userRep.setCredentials(Collections.singletonList(credentials));

        try {
            // Créer l'utilisateur dans Keycloak
            Response response = keycloak.realm(realm).users().create(userRep);

            // Si la création de l'utilisateur réussie (statut 201)
            if (response.getStatus() == 201) {
                // Récupérer l'ID généré par Keycloak
                String keycloakUserId = response.getLocation().getPath().replaceAll(".*/([^/]+)$", "$1");
                user.setKeycloakUserId(keycloakUserId);  // Stocker l'ID Keycloak dans l'entité User

                // Enregistrer l'utilisateur dans la base de données avec l'ID Keycloak
                userRepository.save(user); // Sauvegarde dans la base de données

                // Authentifier l'utilisateur après l'enregistrement
                return authenticateUser(user.getUsername(), user.getPassword());
            } else {
                throw new RuntimeException("Échec de l'enregistrement dans Keycloak : " + response.getStatus());
            }
        } catch (Exception e) {
            // Gérer les exceptions en cas d'erreur
            throw new RuntimeException("Erreur lors de l'enregistrement de l'utilisateur : " + e.getMessage(), e);
        }
    }



    /**
     *
     * Authentifie un utilisateur et retourne son token
     */
    public String authenticateUser(String username, String password) {
        Keycloak keycloak = getKeycloakUserInstance(username, password);

        try {
            AccessTokenResponse accessToken = keycloak.tokenManager().getAccessToken();
            return accessToken.getToken();
        } catch (Exception e) {
            throw new RuntimeException("Échec de l'authentification : " + e.getMessage(), e);
        }
    }

    /**
     * Récupère la liste de tous les utilisateurs
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Récupère un utilisateur par son ID (Correction : `String id` au lieu de `Long id`)
     */
    public Optional<User> getUserById(Long id) { // Correction : ID en String ✅
        return userRepository.findById(id);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    /**
     * Met à jour un utilisateur existant--------------------------------------------------
     */
    public User updateUser(Long id, User updatedUser) {
        Keycloak keycloak = getKeycloakAdminInstance();

        try {
            // Log the received User object
            System.out.println("Received User object: " + updatedUser);

            // Check if the user exists in PostgreSQL
            Optional<User> optionalUser = userRepository.findById(id);
            if (optionalUser.isEmpty()) {
                throw new RuntimeException("User not found");
            }

            // Update the user in PostgreSQL
            User user = optionalUser.get();
            user.setUsername(updatedUser.getUsername());
            user.setPassword(updatedUser.getPassword());
            user.setFirstName(updatedUser.getFirstName());
            user.setLastName(updatedUser.getLastName());
            user.setEmail(updatedUser.getEmail());
            user.setEnabled(updatedUser.isEnabled());
            user.setEmailVerified(updatedUser.isEmailVerified());



            // Save in the database
            userRepository.save(user);

            // Prepare the user representation for Keycloak update
            UserRepresentation userRep = keycloak.realm(realm).users().get(user.getKeycloakUserId()).toRepresentation();
            userRep.setUsername(updatedUser.getUsername());
            userRep.setFirstName(updatedUser.getFirstName());
            userRep.setLastName(updatedUser.getLastName());
            userRep.setEmail(updatedUser.getEmail());
            userRep.setEnabled(updatedUser.isEnabled());
            userRep.setEmailVerified(updatedUser.isEmailVerified());

            if (updatedUser.getPassword() != null) {
                CredentialRepresentation credential = new CredentialRepresentation();
                credential.setType(CredentialRepresentation.PASSWORD);
                credential.setValue(updatedUser.getPassword());
                credential.setTemporary(false);
                userRep.setCredentials(Collections.singletonList(credential));
            }

            System.out.println("User object before sending to Keycloak: " + userRep);
            keycloak.realm(realm).users().get(user.getKeycloakUserId()).update(userRep);

            // If no exception is thrown, the update was successful
            System.out.println("User updated successfully in Keycloak");

            // Return the updated user from the database
            return user;

        } catch (Exception e) {
            System.out.println("Error updating user: " + e.getMessage());
            throw new RuntimeException("Error updating user: " + e.getMessage(), e);
        }
    }
    //--------------------------------------------------------------------------
    public void deleteUser(Long id) {
        Keycloak keycloak = getKeycloakAdminInstance();

        try {
            // Supprimer l'utilisateur dans Keycloak
            Optional<User> optionalUser = userRepository.findById(id);
            if (optionalUser.isPresent()) {
                String keycloakUserId = optionalUser.get().getKeycloakUserId();
                keycloak.realm(realm).users().get(keycloakUserId).remove();
                userRepository.deleteById(id);
            } else {
                throw new RuntimeException("Utilisateur introuvable");
            }

            // Supprimer en base de données
            userRepository.deleteById(id);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la suppression de l'utilisateur : " + e.getMessage(), e);
        }
    }

    // ✅ Assigner un rôle à un utilisateur
    public User assignRoleToUser(Long userId, Long roleId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé !"));
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Rôle non trouvé !"));

        // Ajouter le rôle seulement s'il n'est pas déjà assigné
        if (!user.getRoles().contains(role)) {
            user.getRoles().add(role);
        }

        return userRepository.save(user);
    }


    public Set<Privilege> getUserPrivileges(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        return user.getRoles().stream()
                .flatMap(role -> role.getPrivileges().stream())
                .collect(Collectors.toSet());
    }

    public User findByKeycloakUserId(String keycloakUserId) {
        return userRepository.findByKeycloakUserId(keycloakUserId)
                .orElseThrow(() -> new RuntimeException("User not found with keycloakUserId: " + keycloakUserId));
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username);
    }


}