package com.chatapp.dto;

import com.chatapp.entity.ChatRoom;
import com.chatapp.entity.Message;
import com.chatapp.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class Dtos {

    // ---- Auth DTOs ----
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class RegisterRequest {
        @NotBlank @Size(min = 3, max = 50)
        private String username;
        @NotBlank @Email
        private String email;
        @NotBlank @Size(min = 6)
        private String password;
        private String displayName;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class LoginRequest {
        @NotBlank private String username;
        @NotBlank private String password;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AuthResponse {
        private String accessToken;
        private String refreshToken;
        private UserDto user;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class RefreshRequest {
        private String refreshToken;
    }

    // ---- User DTOs ----
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class UserDto {
        private Long id;
        private String username;
        private String email;
        private String displayName;
        private String avatarUrl;
        private String statusMessage;
        private User.UserStatus status;
        private LocalDateTime lastSeen;
        private LocalDateTime createdAt;

        public static UserDto from(User user) {
            return UserDto.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .displayName(user.getDisplayName() != null ? user.getDisplayName() : user.getUsername())
                    .avatarUrl(user.getAvatarUrl())
                    .statusMessage(user.getStatusMessage())
                    .status(user.getStatus())
                    .lastSeen(user.getLastSeen())
                    .createdAt(user.getCreatedAt())
                    .build();
        }
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class UpdateProfileRequest {
        private String displayName;
        private String statusMessage;
        private String avatarUrl;
    }

    // ---- Room DTOs ----
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class RoomDto {
        private Long id;
        private String name;
        private String description;
        private ChatRoom.RoomType type;
        private UserDto createdBy;
        private List<UserDto> members;
        private int memberCount;
        private LocalDateTime createdAt;
        private MessageDto lastMessage;

        public static RoomDto from(ChatRoom room) {
            return RoomDto.builder()
                    .id(room.getId())
                    .name(room.getName())
                    .description(room.getDescription())
                    .type(room.getType())
                    .createdBy(room.getCreatedBy() != null ? UserDto.from(room.getCreatedBy()) : null)
                    .memberCount(room.getMembers().size())
                    .createdAt(room.getCreatedAt())
                    .build();
        }
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CreateRoomRequest {
        @NotBlank @Size(min = 1, max = 100)
        private String name;
        private String description;
        private ChatRoom.RoomType type;
    }

    // ---- Message DTOs ----
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class MessageDto {
        private Long id;
        private String content;
        private Message.MessageType type;
        private UserDto sender;
        private Long roomId;
        private Boolean isEdited;
        private LocalDateTime createdAt;

        public static MessageDto from(Message message) {
            return MessageDto.builder()
                    .id(message.getId())
                    .content(message.getContent())
                    .type(message.getType())
                    .sender(UserDto.from(message.getSender()))
                    .roomId(message.getChatRoom().getId())
                    .isEdited(message.getIsEdited())
                    .createdAt(message.getCreatedAt())
                    .build();
        }
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class SendMessageRequest {
        @NotBlank private String content;
        private Message.MessageType type;
    }

    // ---- WebSocket DTOs ----
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class WsMessage {
        private String type; // MESSAGE, TYPING, USER_STATUS, JOIN, LEAVE
        private Object payload;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class TypingEvent {
        private Long roomId;
        private Long userId;
        private String username;
        private boolean typing;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class UserStatusEvent {
        private Long userId;
        private String username;
        private User.UserStatus status;
    }
}
