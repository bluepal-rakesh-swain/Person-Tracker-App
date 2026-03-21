package com.financetracker.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
	@Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    private String email;

//    @NotBlank @Size(min = 6)
    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 20, message = "Password must be between 6 and 20 characters")
    @Pattern(
        regexp = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*?&]+$",
        message = "Password must contain at least one letter and one number"
    )
    private String password;

    

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 50, message = "Full name must be between 2 and 50 characters")
    @Pattern(
        regexp = "^[A-Za-z ]+$",
        message = "Full name can only contain letters and spaces"
    )
    private String fullName;

    @NotBlank(message = "Currency is required")
    @Pattern(
        regexp = "^[A-Z]{3}$",
        message = "Currency must be a valid 3-letter ISO code (e.g., USD, INR)"
    )
    private String currency;
}
