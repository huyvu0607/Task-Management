package com.example.backend.service;

import org.springframework.web.multipart.MultipartFile;

public interface IFileUploadService {

    /**
     * Upload avatar lên Cloudinary
     * @param file File upload từ client
     * @param userId ID của user (để tạo folder riêng)
     * @return URL của ảnh đã upload
     */
    String uploadAvatar(MultipartFile file, Long userId);
}