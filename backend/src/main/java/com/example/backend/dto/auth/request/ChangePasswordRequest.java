package com.example.backend.dto.auth.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChangePasswordRequest {

    @NotBlank(message = "Old password không được để trống")
    private String oldPassword;

    @NotBlank(message = "New password không được để trống")
    @Size(min = 8, message = "New password phải có ít nhất 8 ký tự")
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$",
            message = "New password phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số"
    )
    private String newPassword;

    @NotBlank(message = "Confirm password không được để trống")
    private String confirmPassword;
}