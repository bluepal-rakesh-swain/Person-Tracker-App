package com.financetracker.config;

import com.financetracker.security.JwtService;
import com.financetracker.service.WebSocketNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
@Slf4j
public class WebSocketConfig implements WebSocketConfigurer {

    private final JwtService jwtService;
    private final WebSocketNotificationService notificationService;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(new BudgetAlertHandler(jwtService, notificationService), "/ws/notifications")
                .setAllowedOrigins("*");
    }

    @RequiredArgsConstructor
    @Slf4j
    static class BudgetAlertHandler extends TextWebSocketHandler {

        private final JwtService jwtService;
        private final WebSocketNotificationService notificationService;

        @Override
        public void afterConnectionEstablished(WebSocketSession session) {
            String token = extractToken(session);
            if (token == null) {
                closeQuietly(session);
                return;
            }
            try {
                String email = jwtService.extractEmail(token);
                if (email == null || !jwtService.isTokenValid(token, email)) {
                    closeQuietly(session);
                    return;
                }
                // Store userId in session attributes for later use
                Long userId = (Long) session.getAttributes().get("userId");
                if (userId == null) {
                    // Resolve userId via email — stored by handshake interceptor
                    // We store it during token validation below
                }
                notificationService.register(email, session);
                log.debug("WS connected: {}", email);
            } catch (Exception e) {
                log.warn("WS auth failed: {}", e.getMessage());
                closeQuietly(session);
            }
        }

        @Override
        public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
            notificationService.remove(session);
        }

        @Override
        protected void handleTextMessage(WebSocketSession session, TextMessage message) {
            // Client messages not needed — server-push only
        }

        private String extractToken(WebSocketSession session) {
            // Token passed as query param: /ws/notifications?token=...
            String query = session.getUri() != null ? session.getUri().getQuery() : null;
            if (query == null) return null;
            for (String part : query.split("&")) {
                if (part.startsWith("token=")) return part.substring(6);
            }
            return null;
        }

        private void closeQuietly(WebSocketSession session) {
            try { session.close(CloseStatus.NOT_ACCEPTABLE); } catch (Exception ignored) {}
        }
    }
}
