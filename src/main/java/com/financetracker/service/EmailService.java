package com.financetracker.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendVerificationOtpEmail(String toEmail, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Personal Finance Tracker — Verify Your Email");
            message.setText(
                "Hello,\n\n" +
                "Thank you for registering with Personal Finance Tracker.\n\n" +
                "Your email verification OTP is:\n\n" +
                "  " + otp + "\n\n" +
                "This OTP is valid for 10 minutes. Enter it on the verification page to activate your account.\n\n" +
                "If you did not register, please ignore this email.\n\n" +
                "— Personal Finance Tracker Team"
            );
            mailSender.send(message);
            log.info("Verification OTP email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send verification OTP email to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Failed to send verification email. Please try again later.");
        }
    }

    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Personal Finance Tracker — Password Reset OTP");
            message.setText(
                "Hello,\n\n" +
                "You requested a password reset for your Personal Finance Tracker account.\n\n" +
                "Your OTP is:\n\n" +
                "  " + resetToken + "\n\n" +
                "This OTP is valid for 15 minutes. Enter it on the reset password page.\n\n" +
                "If you did not request this, please ignore this email.\n\n" +
                "— Personal Finance Tracker Team"
            );
            mailSender.send(message);
            log.info("Password reset email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Failed to send reset email. Please try again later.");
        }
    }
}
