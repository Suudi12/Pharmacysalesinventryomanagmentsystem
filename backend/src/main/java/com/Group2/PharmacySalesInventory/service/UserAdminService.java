package com.Group2.PharmacySalesInventory.service;

import com.Group2.PharmacySalesInventory.dto.request.CreateUserRequest;
import com.Group2.PharmacySalesInventory.entity.Role;
import com.Group2.PharmacySalesInventory.entity.User;
import com.Group2.PharmacySalesInventory.exception.DuplicateResourceException;
import com.Group2.PharmacySalesInventory.exception.ResourceNotFoundException;
import com.Group2.PharmacySalesInventory.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserAdminService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<User> getAll() {
        return userRepository.findAll();
    }


    @Transactional
    public User createUser(CreateUserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Username-kan '" + request.getUsername() + "' horey ayaa loo isticmaalay");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email-kan '" + request.getEmail() + "' horey ayaa loo isticmaalay");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .status(true)
                .build();

        return userRepository.save(user);
    }

    public User getById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User lama helin, ID: " + id));
    }

    @Transactional
    public User updateRole(Long id, Role newRole) {
        User user = getById(id);
        user.setRole(newRole);
        return userRepository.save(user);
    }

    @Transactional
    public User setStatus(Long id, boolean status) {
        User user = getById(id);
        user.setStatus(status);
        return userRepository.save(user);
    }

    @Transactional
    public String deleteUser(Long id) {
        User user = getById(id);
        userRepository.delete(user);
        return "User '" + user.getUsername() + "' (ID: " + id + ") si guul leh ayaa loo tirtiray.";
    }
}
