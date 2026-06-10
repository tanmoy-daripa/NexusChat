package com.chatapp.config;

import com.chatapp.entity.ChatRoom;
import com.chatapp.entity.User;
import com.chatapp.repository.ChatRoomRepository;
import com.chatapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        seedSystemUser();
        seedDefaultRooms();
    }

    private void seedSystemUser() {
        if (userRepository.existsByUsername("system")) return;

        User system = User.builder()
                .username("system")
                .email("system@nexuschat.app")
                .password(passwordEncoder.encode(java.util.UUID.randomUUID().toString()))
                .displayName("NexusChat")
                .status(User.UserStatus.ONLINE)
                .build();

        userRepository.save(system);
        log.info("System user created.");
    }

    private void seedDefaultRooms() {
        List<String[]> defaults = List.of(
            new String[]{"general",     "General discussion for everyone"},
            new String[]{"random",      "Off-topic conversations"},
            new String[]{"tech-talk",   "Programming, tools, and tech news"},
            new String[]{"introductions", "Say hello to the community!"}
        );

        User system = userRepository.findByUsername("system").orElseThrow();

        for (String[] room : defaults) {
            String name = room[0];
            if (chatRoomRepository.findPublicRooms().stream().anyMatch(r -> r.getName().equals(name))) continue;

            ChatRoom chatRoom = ChatRoom.builder()
                    .name(name)
                    .description(room[1])
                    .type(ChatRoom.RoomType.PUBLIC)
                    .createdBy(system)
                    .build();
            chatRoom.getMembers().add(system);
            chatRoomRepository.save(chatRoom);
            log.info("Created default room: #{}", name);
        }
    }
}
