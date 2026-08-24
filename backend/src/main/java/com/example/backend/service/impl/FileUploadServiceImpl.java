package com.example.backend.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.backend.service.IFileUploadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileUploadServiceImpl implements IFileUploadService {

    private final Cloudinary cloudinary;

    @Value("${upload.max-file-size:5242880}") // Default 5MB = 5 * 1024 * 1024 bytes
    private long maxFileSize;

    @Value("${upload.allowed-extensions:jpg,jpeg,png,gif}")
    private String allowedExtensions;

    @Override
    public String uploadAvatar(MultipartFile file, Long userId) {
        log.info("📤 Upload avatar cho user ID: {}", userId);

        // ========== VALIDATION ==========

        // 1. Check file không null và không rỗng
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File không được để trống");
        }

        // 2. Check file size (FR-1.3: tối đa 5MB)
        if (file.getSize() > maxFileSize) {
            throw new RuntimeException("File quá lớn. Kích thước tối đa: 5MB");
        }

        // 3. Check file extension (FR-1.3: JPG, PNG, GIF)
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new RuntimeException("Tên file không hợp lệ");
        }

        String extension = getFileExtension(originalFilename).toLowerCase();
        List<String> allowedExtList = Arrays.asList(allowedExtensions.split(","));

        if (!allowedExtList.contains(extension)) {
            throw new RuntimeException("File không đúng định dạng. Chỉ chấp nhận: " + allowedExtensions);
        }

        // ========== UPLOAD TO CLOUDINARY ==========

        try {
            // Upload với options
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", "teamflow/avatars",           // Lưu vào folder avatars
                    "public_id", "user_" + userId,          // Đặt tên file theo user ID
                    "overwrite", true,                      // Ghi đè nếu đã tồn tại
                    "resource_type", "image",               // Loại file: image
                    "transformation", new com.cloudinary.Transformation()
                            .width(400).height(400)         // Resize về 400x400
                            .crop("fill")                   // Crop để vừa khung
                            .gravity("face")                // Focus vào mặt (nếu có)
                            .quality("auto")                // Tự động optimize chất lượng
            ));

            // Lấy URL của ảnh đã upload
            String imageUrl = (String) uploadResult.get("secure_url");

            log.info("✅ Upload thành công: {}", imageUrl);
            return imageUrl;

        } catch (IOException e) {
            log.error("❌ Lỗi upload ảnh: {}", e.getMessage());
            throw new RuntimeException("Không thể upload ảnh: " + e.getMessage());
        }
    }

    /**
     * Lấy extension từ filename
     */
    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf(".");
        if (lastDotIndex == -1) {
            return "";
        }
        return filename.substring(lastDotIndex + 1);
    }
}