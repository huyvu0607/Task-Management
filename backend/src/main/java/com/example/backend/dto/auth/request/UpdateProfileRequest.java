package com.example.backend.dto.auth.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @Size(min = 2, max = 100, message = "Full name phải từ 2-100 ký tự")
    private String fullName;

    @Size(max = 500, message = "Bio không được quá 500 ký tự")
    private String bio;

    private String timezone;

    private String avatarUrl; // URL của avatar (sau khi upload)

    // ========== NEW FIELDS ==========

    @Pattern(regexp = "^[+]?[0-9\\s-()]*$", message = "Số điện thoại không hợp lệ")
    @Size(max = 20, message = "Số điện thoại không được quá 20 ký tự")
    private String phoneNumber;

    @Size(max = 100, message = "Department không được quá 100 ký tự")
    private String department;

    @Size(max = 100, message = "Job title không được quá 100 ký tự")
    private String jobTitle;
}