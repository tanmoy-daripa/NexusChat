package com.chatapp.service;

import com.chatapp.dto.Dtos.*;
import com.chatapp.entity.User;
import com.chatapp.exception.AppException;
import com.chatapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public UserDto getProfile(String username) {
        return userRepository.findByUsername(username)
                .map(UserDto::from)
                .orElseThrow(() -> new AppException("User not found"));
    }

    @Transactional
    public UserDto updateProfile(String username, UpdateProfileRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException("User not found"));

        if (request.getDisplayName() != null) user.setDisplayName(request.getDisplayName());
        if (request.getStatusMessage() != null) user.setStatusMessage(request.getStatusMessage());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());

        return UserDto.from(userRepository.save(user));
    }

    @Transactional
    public void updateStatus(String username, User.UserStatus status) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException("User not found"));

        user.setStatus(status);
        if (status == User.UserStatus.OFFLINE) {
            user.setLastSeen(LocalDateTime.now());
        }
        userRepository.save(user);

        // Broadcast status change
        UserStatusEvent event = UserStatusEvent.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .status(status)
                .build();

        messagingTemplate.convertAndSend("/topic/users/status",
            WsMessage.builder().type("USER_STATUS").payload(event).build());
    }

    public List<UserDto> searchUsers(String query) {
        return userRepository.searchUsers(query).stream()
                .map(UserDto::from)
                .collect(Collectors.toList());
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserDto::from)
                .collect(Collectors.toList());
    }
}
