package com.chatapp.service;

import com.chatapp.dto.Dtos.*;
import com.chatapp.entity.ChatRoom;
import com.chatapp.entity.Message;
import com.chatapp.entity.User;
import com.chatapp.exception.AppException;
import com.chatapp.repository.ChatRoomRepository;
import com.chatapp.repository.MessageRepository;
import com.chatapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public List<RoomDto> getPublicRooms() {
        return chatRoomRepository.findPublicRooms().stream()
                .map(RoomDto::from)
                .collect(Collectors.toList());
    }

    public List<RoomDto> getUserRooms(Long userId) {
        return chatRoomRepository.findRoomsByUserId(userId).stream()
                .map(RoomDto::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public RoomDto createRoom(CreateRoomRequest request, User creator) {
        ChatRoom room = ChatRoom.builder()
                .name(request.getName())
                .description(request.getDescription())
                .type(request.getType() != null ? request.getType() : ChatRoom.RoomType.PUBLIC)
                .createdBy(creator)
                .build();

        room.getMembers().add(creator);
        creator.getChatRooms().add(room);

        chatRoomRepository.save(room);
        userRepository.save(creator);

        return RoomDto.from(room);
    }

    @Transactional
    public RoomDto joinRoom(Long roomId, User user) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new AppException("Room not found"));

        room.getMembers().add(user);
        user.getChatRooms().add(room);

        chatRoomRepository.save(room);
        userRepository.save(user);

        // Notify room members
        MessageDto systemMsg = sendSystemMessage(room, user.getUsername() + " joined the room");
        messagingTemplate.convertAndSend("/topic/room/" + roomId, 
            WsMessage.builder().type("MESSAGE").payload(systemMsg).build());

        return RoomDto.from(room);
    }

    @Transactional
    public void leaveRoom(Long roomId, User user) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new AppException("Room not found"));

        room.getMembers().remove(user);
        user.getChatRooms().remove(room);

        chatRoomRepository.save(room);
        userRepository.save(user);

        MessageDto systemMsg = sendSystemMessage(room, user.getUsername() + " left the room");
        messagingTemplate.convertAndSend("/topic/room/" + roomId, 
            WsMessage.builder().type("MESSAGE").payload(systemMsg).build());
    }

    public List<MessageDto> getRoomMessages(Long roomId, int page, int size) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new AppException("Room not found"));

        Page<Message> messages = messageRepository
                .findByChatRoomIdAndIsDeletedFalseOrderByCreatedAtDesc(roomId, PageRequest.of(page, size));

        return messages.getContent().stream()
                .map(MessageDto::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public MessageDto sendMessage(Long roomId, SendMessageRequest request, User sender) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new AppException("Room not found"));

        Message message = Message.builder()
                .content(request.getContent())
                .type(request.getType() != null ? request.getType() : Message.MessageType.TEXT)
                .sender(sender)
                .chatRoom(room)
                .build();

        Message saved = messageRepository.save(message);
        MessageDto dto = MessageDto.from(saved);

        // Broadcast to room subscribers
        messagingTemplate.convertAndSend("/topic/room/" + roomId,
            WsMessage.builder().type("MESSAGE").payload(dto).build());

        return dto;
    }

    public void handleTyping(Long roomId, User user, boolean isTyping) {
        TypingEvent event = TypingEvent.builder()
                .roomId(roomId)
                .userId(user.getId())
                .username(user.getUsername())
                .typing(isTyping)
                .build();

        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/typing",
            WsMessage.builder().type("TYPING").payload(event).build());
    }

    @Transactional
    public RoomDto getOrCreateDirectRoom(Long targetUserId, User currentUser) {
        return chatRoomRepository.findDirectRoom(currentUser.getId(), targetUserId)
                .map(RoomDto::from)
                .orElseGet(() -> {
                    User targetUser = userRepository.findById(targetUserId)
                            .orElseThrow(() -> new AppException("User not found"));

                    ChatRoom room = ChatRoom.builder()
                            .name(currentUser.getUsername() + "_" + targetUser.getUsername())
                            .type(ChatRoom.RoomType.DIRECT)
                            .createdBy(currentUser)
                            .build();

                    room.getMembers().add(currentUser);
                    room.getMembers().add(targetUser);
                    currentUser.getChatRooms().add(room);
                    targetUser.getChatRooms().add(room);

                    chatRoomRepository.save(room);
                    userRepository.save(currentUser);
                    userRepository.save(targetUser);

                    return RoomDto.from(room);
                });
    }

    private MessageDto sendSystemMessage(ChatRoom room, String content) {
        User system = userRepository.findByUsername("system").orElse(null);
        Message message = Message.builder()
                .content(content)
                .type(Message.MessageType.SYSTEM)
                .sender(system != null ? system : room.getCreatedBy())
                .chatRoom(room)
                .build();
        return MessageDto.from(messageRepository.save(message));
    }
}
