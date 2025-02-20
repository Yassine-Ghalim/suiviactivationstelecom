package net.yassine.auth_service.Service;

import net.yassine.auth_service.Entity.Role;
import net.yassine.auth_service.Entity.User;
import net.yassine.auth_service.Repository.RoleRepository;
import net.yassine.auth_service.Repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.Optional;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    // Suppression du PasswordEncoder car vous ne souhaitez pas hasher les mots de passe
    public UserService(UserRepository userRepository,RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return (UserDetails) userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    // ✅ Valider un utilisateur (Login)
    public User validateUser(String username, String password) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        if (user.getPassword().equals(password)) {  // Comparaison directe sans hachage
            return user;
        } else {
            throw new UsernameNotFoundException("Invalid credentials");
        }
    }

    // ✅ Ajouter un nouvel utilisateur (Inscription) sans hachage du mot de passe
    public User createUser(User user) {
        if (user.getPassword() == null || user.getPassword().isEmpty()) {
            throw new IllegalArgumentException("Password cannot be empty");
        }

        user.setId(UUID.randomUUID().toString()); // Générer un ID unique
        // Ne pas hasher le mot de passe, le stocker tel quel
        // user.setPassword(passwordEncoder.encode(user.getPassword())); // Hachage supprimé

        return userRepository.save(user);
    }

    // ✅ Récupérer la liste de tous les utilisateurs
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // ✅ Récupérer un utilisateur par son ID
    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }

    // ✅ Mettre à jour un utilisateur
    public User updateUser(String id, User updatedUser) {
        return userRepository.findById(id).map(user -> {
            user.setUsername(updatedUser.getUsername());
            user.setEmail(updatedUser.getEmail());
            user.setFirstName(updatedUser.getFirstName());
            user.setLastName(updatedUser.getLastName());
            user.setEnabled(updatedUser.isEnabled());

            // Si le mot de passe est fourni, ne pas le hasher
            if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
                user.setPassword(updatedUser.getPassword());  // Ne pas hacher le mot de passe
            }

            return userRepository.save(user);
        }).orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    // ✅ Supprimer un utilisateur
    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }

    public User assignRoleToUser(String userId, String roleId) {
        Optional<User> userOpt = userRepository.findById(userId);
        Optional<Role> roleOpt = roleRepository.findById(roleId);

        if (userOpt.isPresent() && roleOpt.isPresent()) {
            User user = userOpt.get();
            Role role = roleOpt.get();

            // Ajouter le rôle à l'utilisateur
            user.getRoles().add(role);

            // Sauvegarder l'utilisateur avec le nouveau rôle
            return userRepository.save(user);
        } else {
            throw new RuntimeException("Utilisateur ou rôle non trouvé !");
        }
    }
}
