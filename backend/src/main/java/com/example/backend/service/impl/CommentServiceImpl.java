package com.example.backend.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.backend.dto.comment.request.CreateCommentRequest;
import com.example.backend.dto.comment.request.UpdateCommentRequest;
import com.example.backend.dto.comment.response.AttachmentResponse;
import com.example.backend.dto.comment.response.CommentDetailResponse;
import com.example.backend.dto.comment.response.CommentResponse;
import com.example.backend.dto.comment.response.MentionResponse;
import com.example.backend.dto.dashboard.UserSimpleDTO;
import com.example.backend.exception.BusinessException;
import com.example.backend.model.*;
import com.example.backend.repository.*;
import com.example.backend.service.ICommentService;
import com.example.backend.service.INotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Implementation của CommentService
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CommentServiceImpl implements ICommentService {

    private final CommentRepository commentRepository;
    private final CommentMentionRepository commentMentionRepository;
    private final AttachmentRepository attachmentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final INotificationService INotificationService;
    private final Cloudinary cloudinary;

    @Value("${app.attachment.max-files-per-task:5}")
    private int maxFilesPerTask;

    @Value("${app.attachment.allowed-types:pdf,doc,docx,xls,xlsx,png,jpg,jpeg,gif}")
    private String allowedFileTypes;

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    // ========== COMMENT CRUD ==========

    @Override
    public CommentResponse createComment(CreateCommentRequest request, Long userId) {
        log.info("📝 Tạo comment mới cho task: {}", request.getTaskId());

        // Validate task exists
        Task task = taskRepository.findById(request.getTaskId())
                .orElseThrow(() -> new BusinessException("Task không tồn tại"));

        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("User không tồn tại"));

        // Check user có quyền comment trên task này không (phải là member của team)
        checkTaskAccess(task, userId);

        // Tạo comment
        Comment comment = new Comment();
        comment.setTask(task);
        comment.setUser(user);
        comment.setContent(request.getContent());
        comment.setIsEdited(false);

        Comment savedComment = commentRepository.save(comment);
        log.info("✅ Đã tạo comment ID: {}", savedComment.getId());

        // Xử lý mentions (nếu có)
        if (request.getMentionedUsernames() != null && !request.getMentionedUsernames().isEmpty()) {
            processMentions(savedComment, request.getMentionedUsernames(), user, task);
        }

        // Gửi notification cho assignees (FR-6.1)
        INotificationService.createNewCommentNotification(savedComment, task);

        return mapToCommentResponse(savedComment, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public CommentDetailResponse getCommentById(Long commentId, Long userId) {
        log.info("📋 Lấy comment detail: {}", commentId);

        Comment comment = commentRepository.findByIdWithUser(commentId)
                .orElseThrow(() -> new BusinessException("Comment không tồn tại"));

        // Check access
        checkTaskAccess(comment.getTask(), userId);

        return mapToCommentDetailResponse(comment, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsByTask(Long taskId, Long userId) {
        log.info("📋 Lấy comments của task: {}", taskId);

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new BusinessException("Task không tồn tại"));

        checkTaskAccess(task, userId);

        List<Comment> comments = commentRepository.findByTaskIdWithMentions(taskId);

        return comments.stream()
                .map(comment -> mapToCommentResponse(comment, userId))
                .collect(Collectors.toList());
    }

    @Override
    public CommentResponse updateComment(Long commentId, UpdateCommentRequest request, Long userId) {
        log.info("✏️ Cập nhật comment: {}", commentId);

        Comment comment = commentRepository.findByIdWithUser(commentId)
                .orElseThrow(() -> new BusinessException("Comment không tồn tại"));

        // FR-6.3: Chỉ author có quyền edit
        if (!comment.getUser().getId().equals(userId)) {
            throw new BusinessException("Bạn không có quyền edit comment này");
        }

        // Update content
        comment.setContent(request.getContent());
        comment.setIsEdited(true);
        comment.setEditedAt(LocalDateTime.now());

        // Update mentions (nếu có)
        if (request.getMentionedUsernames() != null) {
            // Xóa mentions cũ
            commentMentionRepository.deleteByCommentId(commentId);

            // Tạo mentions mới
            if (!request.getMentionedUsernames().isEmpty()) {
                processMentions(comment, request.getMentionedUsernames(), comment.getUser(), comment.getTask());
            }
        }

        Comment updatedComment = commentRepository.save(comment);
        log.info("✅ Đã cập nhật comment ID: {}", commentId);

        return mapToCommentResponse(updatedComment, userId);
    }

    @Override
    public void deleteComment(Long commentId, Long userId) {
        log.info("🗑️ Xóa comment: {}", commentId);

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new BusinessException("Comment không tồn tại"));

        // FR-6.3: Chỉ author hoặc admin có quyền delete
        boolean isOwner = comment.getUser().getId().equals(userId);
        boolean isAdmin = isTeamAdmin(comment.getTask(), userId);

        if (!isOwner && !isAdmin) {
            throw new BusinessException("Bạn không có quyền xóa comment này");
        }

        commentRepository.delete(comment);
        log.info("✅ Đã xóa comment ID: {}", commentId);
    }

    // ========== ATTACHMENT MANAGEMENT ==========

    @Override
    public AttachmentResponse uploadAttachment(
            Long commentId,
            Long taskId,
            MultipartFile file,
            Long userId
    ) {
        log.info("📤 Upload attachment - commentId: {}, taskId: {}", commentId, taskId);

        // Validate input
        if (commentId == null && taskId == null) {
            throw new BusinessException("Phải cung cấp commentId hoặc taskId");
        }

        if (file == null || file.isEmpty()) {
            throw new BusinessException("File không được để trống");
        }

        // Validate file size (FR-6.4: Max 10MB)
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BusinessException("File quá lớn. Kích thước tối đa: 10MB");
        }

        // Validate file type
        String fileType = getFileExtension(file.getOriginalFilename());
        if (!isAllowedFileType(fileType)) {
            throw new BusinessException(
                    "File không đúng định dạng. Chỉ chấp nhận: " + allowedFileTypes
            );
        }

        // Get entities
        Comment comment = null;
        Task task = null;

        if (commentId != null) {
            comment = commentRepository.findById(commentId)
                    .orElseThrow(() -> new BusinessException("Comment không tồn tại"));
            task = comment.getTask();
        } else {
            task = taskRepository.findById(taskId)
                    .orElseThrow(() -> new BusinessException("Task không tồn tại"));
        }

        // Check access
        checkTaskAccess(task, userId);

        // FR-6.4: Max 5 files per task
        long currentFileCount = attachmentRepository.countAllByTaskId(task.getId());
        if (currentFileCount >= maxFilesPerTask) {
            throw new BusinessException(
                    "Đã đạt giới hạn số file tối đa (" + maxFilesPerTask + " files)"
            );
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("User không tồn tại"));

        // Upload to Cloudinary
        String cloudinaryUrl;
        try {
            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "teamflow/attachments",
                            "resource_type", "auto"
                    )
            );
            cloudinaryUrl = (String) uploadResult.get("secure_url");
        } catch (IOException e) {
            log.error("❌ Lỗi upload file: {}", e.getMessage());
            throw new BusinessException("Không thể upload file: " + e.getMessage());
        }

        // Save attachment
        Attachment attachment = new Attachment();
        attachment.setTask(task);
        attachment.setComment(comment);
        attachment.setUploadedBy(user);
        attachment.setFileName(file.getOriginalFilename());
        attachment.setFilePath(cloudinaryUrl);
        attachment.setFileSize(file.getSize());
        attachment.setFileType(fileType);
        attachment.setMimeType(file.getContentType());

        Attachment savedAttachment = attachmentRepository.save(attachment);
        log.info("✅ Đã upload attachment ID: {}", savedAttachment.getId());

        return mapToAttachmentResponse(savedAttachment, userId);
    }

    @Override
    public List<AttachmentResponse> uploadMultipleAttachments(
            Long commentId,
            Long taskId,
            List<MultipartFile> files,
            Long userId
    ) {
        log.info("📤 Upload {} files", files.size());

        List<AttachmentResponse> responses = new ArrayList<>();

        for (MultipartFile file : files) {
            try {
                AttachmentResponse response = uploadAttachment(commentId, taskId, file, userId);
                responses.add(response);
            } catch (Exception e) {
                log.error("❌ Lỗi upload file {}: {}", file.getOriginalFilename(), e.getMessage());
                // Continue uploading other files
            }
        }

        return responses;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttachmentResponse> getAttachmentsByTask(Long taskId) {
        List<Attachment> attachments = attachmentRepository.findAllByTaskId(taskId);

        return attachments.stream()
                .map(att -> mapToAttachmentResponse(att, null))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttachmentResponse> getAttachmentsByComment(Long commentId) {
        List<Attachment> attachments = attachmentRepository.findByCommentId(commentId);

        return attachments.stream()
                .map(att -> mapToAttachmentResponse(att, null))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] downloadAttachment(Long attachmentId, Long userId) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new BusinessException("Attachment không tồn tại"));

        // Check access
        Task task = attachment.getTask() != null ? attachment.getTask() : attachment.getComment().getTask();
        checkTaskAccess(task, userId);

        // TODO: Download from Cloudinary
        throw new BusinessException("Download chưa được implement");
    }

    @Override
    public void deleteAttachment(Long attachmentId, Long userId) {
        log.info("🗑️ Xóa attachment: {}", attachmentId);

        Attachment attachment = attachmentRepository.findByIdWithUser(attachmentId)
                .orElseThrow(() -> new BusinessException("Attachment không tồn tại"));

        // FR-6.4: Chỉ uploader hoặc admin có quyền xóa
        Task task = attachment.getTask() != null ? attachment.getTask() : attachment.getComment().getTask();
        boolean isOwner = attachment.getUploadedBy().getId().equals(userId);
        boolean isAdmin = isTeamAdmin(task, userId);

        if (!isOwner && !isAdmin) {
            throw new BusinessException("Bạn không có quyền xóa attachment này");
        }

        // TODO: Delete from Cloudinary
        // cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());

        attachmentRepository.delete(attachment);
        log.info("✅ Đã xóa attachment ID: {}", attachmentId);
    }

    // ========== SEARCH & FILTER ==========

    @Override
    @Transactional(readOnly = true)
    public List<CommentResponse> searchComments(Long taskId, String keyword, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new BusinessException("Task không tồn tại"));

        checkTaskAccess(task, userId);

        List<Comment> comments = commentRepository.searchByTaskIdAndContent(taskId, keyword);

        return comments.stream()
                .map(comment -> mapToCommentResponse(comment, userId))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsWithAttachments(Long taskId, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new BusinessException("Task không tồn tại"));

        checkTaskAccess(task, userId);

        List<Comment> comments = commentRepository.findByTaskIdWithAttachments(taskId);

        return comments.stream()
                .map(comment -> mapToCommentResponse(comment, userId))
                .collect(Collectors.toList());
    }

    // ========== STATISTICS ==========

    @Override
    @Transactional(readOnly = true)
    public Long countCommentsByTask(Long taskId) {
        return commentRepository.countByTaskId(taskId);
    }

    @Override
    @Transactional(readOnly = true)
    public Long countAttachmentsByTask(Long taskId) {
        return attachmentRepository.countAllByTaskId(taskId);
    }

    // ========== HELPER METHODS - CONTINUED IN NEXT ARTIFACT ==========
// ========== HELPER METHODS (Thêm vào cuối CommentServiceImpl.java) ==========

    /**
     * Xử lý mentions trong comment
     * FR-6.2: Mention user bằng @username
     */
    private void processMentions(Comment comment, List<String> mentionedUsernames, User mentionedBy, Task task) {
        log.info("🏷️ Xử lý {} mentions", mentionedUsernames.size());

        // Get team members (chỉ mention được members trong team)
        Long teamId = task.getProject().getTeam().getId();
        List<TeamMember> teamMemberEntities = teamMemberRepository.findByTeamId(teamId);
        List<User> teamMembers = teamMemberEntities.stream()
                .map(TeamMember::getUser)
                .collect(Collectors.toList());
        Set<String> teamMemberUsernames = teamMembers.stream()
                .map(User::getUsername)
                .collect(Collectors.toSet());

        List<User> mentionedUsers = new ArrayList<>();

        for (String username : mentionedUsernames) {
            // Validate: Chỉ mention được team members
            if (!teamMemberUsernames.contains(username)) {
                log.warn("⚠️ User {} không phải là member của team, skip mention", username);
                continue;
            }

            // Tìm user
            User user = userRepository.findByUsername(username)
                    .orElse(null);

            if (user == null) {
                log.warn("⚠️ User {} không tồn tại, skip mention", username);
                continue;
            }

            // Tránh duplicate mention
            boolean exists = commentMentionRepository.existsByCommentIdAndMentionedUserId(
                    comment.getId(),
                    user.getId()
            );

            if (exists) {
                log.debug("Mention đã tồn tại, skip");
                continue;
            }

            // Tạo mention
            CommentMention mention = new CommentMention(comment, user);
            commentMentionRepository.save(mention);
            mentionedUsers.add(user);

            log.info("✅ Đã mention user: {}", username);
        }

        // Gửi notifications cho users được mention
        if (!mentionedUsers.isEmpty()) {
            INotificationService.createMentionNotifications(mentionedUsers, comment, mentionedBy);
        }
    }

    /**
     * Check user có quyền access task không (phải là member của team)
     */
    private void checkTaskAccess(Task task, Long userId) {
        Long teamId = task.getProject().getTeam().getId();

        boolean isMember = teamMemberRepository.existsByTeamIdAndUserId(teamId, userId);

        if (!isMember) {
            throw new BusinessException("Bạn không có quyền truy cập task này");
        }
    }

    /**
     * Check user có phải admin của team không
     */
    private boolean isTeamAdmin(Task task, Long userId) {
        Long teamId = task.getProject().getTeam().getId();

        return teamMemberRepository.findByTeamIdAndUserId(teamId, userId)
                .map(member -> "ADMIN".equals(member.getRole().name()))
                .orElse(false);
    }

    /**
     * Parse @mentions từ comment content
     * Pattern: @username
     */
    private List<String> extractMentionsFromContent(String content) {
        List<String> mentions = new ArrayList<>();
        Pattern pattern = Pattern.compile("@(\\w+)");
        Matcher matcher = pattern.matcher(content);

        while (matcher.find()) {
            String username = matcher.group(1);
            if (!mentions.contains(username)) {
                mentions.add(username);
            }
        }

        return mentions;
    }

    /**
     * Map Comment entity sang CommentResponse DTO
     */
    private CommentResponse mapToCommentResponse(Comment comment, Long currentUserId) {
        // Map mentions
        List<MentionResponse> mentions = comment.getMentions().stream()
                .map(this::mapToMentionResponse)
                .collect(Collectors.toList());

        List<AttachmentResponse> attachments = comment.getAttachments().stream()
                .map(att -> mapToAttachmentResponse(att, currentUserId))
                .collect(Collectors.toList());

        // Check permissions
        boolean canEdit = comment.getUser().getId().equals(currentUserId);
        boolean canDelete = canEdit || isTeamAdmin(comment.getTask(), currentUserId);

        return CommentResponse.builder()
                .id(comment.getId())
                .taskId(comment.getTask().getId())
                .content(comment.getContent())
                .user(mapToUserSimpleDTO(comment.getUser()))
                .isEdited(comment.getIsEdited())
                .editedAt(comment.getEditedAt())
                .mentions(mentions)
                .attachments(attachments)
                .attachmentCount(comment.getAttachmentCount())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .canEdit(canEdit)
                .canDelete(canDelete)
                .build();
    }

    /**
     * Map Comment entity sang CommentDetailResponse DTO
     */
    private CommentDetailResponse mapToCommentDetailResponse(Comment comment, Long currentUserId) {
        // Map mentions
        List<MentionResponse> mentions = comment.getMentions().stream()
                .map(this::mapToMentionResponse)
                .collect(Collectors.toList());

        // Map attachments
        List<AttachmentResponse> attachments = comment.getAttachments().stream()
                .map(att -> mapToAttachmentResponse(att, currentUserId))
                .collect(Collectors.toList());

        // Check permissions
        boolean canEdit = comment.getUser().getId().equals(currentUserId);
        boolean canDelete = canEdit || isTeamAdmin(comment.getTask(), currentUserId);

        return CommentDetailResponse.builder()
                .id(comment.getId())
                .taskId(comment.getTask().getId())
                .taskTitle(comment.getTask().getTitle())
                .content(comment.getContent())
                .user(mapToUserSimpleDTO(comment.getUser()))
                .isEdited(comment.getIsEdited())
                .editedAt(comment.getEditedAt())
                .mentions(mentions)
                .attachments(attachments)
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .canEdit(canEdit)
                .canDelete(canDelete)
                .build();
    }

    /**
     * Map CommentMention sang MentionResponse
     */
    private MentionResponse mapToMentionResponse(CommentMention mention) {
        User user = mention.getMentionedUser();

        return MentionResponse.builder()
                .id(mention.getId())
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .createdAt(mention.getCreatedAt())
                .build();
    }

    /**
     * Map Attachment sang AttachmentResponse
     */
    private AttachmentResponse mapToAttachmentResponse(Attachment attachment, Long currentUserId) {
        // Check permission
        boolean canDelete = false;
        if (currentUserId != null) {
            Task task = attachment.getTask() != null ? attachment.getTask() : attachment.getComment().getTask();
            canDelete = attachment.getUploadedBy().getId().equals(currentUserId)
                    || isTeamAdmin(task, currentUserId);
        }

        // Format file size
        String fileSizeFormatted = formatFileSize(attachment.getFileSize());

        // Check if image
        boolean isImage = attachment.getMimeType() != null
                && attachment.getMimeType().startsWith("image/");

        return AttachmentResponse.builder()
                .id(attachment.getId())
                .taskId(attachment.getTask() != null ? attachment.getTask().getId() : null)
                .commentId(attachment.getComment() != null ? attachment.getComment().getId() : null)
                .fileName(attachment.getFileName())
                .downloadUrl("/api/attachments/" + attachment.getId() + "/download")
                .previewUrl(attachment.getFilePath()) // Cloudinary URL
                .fileSize(attachment.getFileSize())
                .fileSizeFormatted(fileSizeFormatted)
                .fileType(attachment.getFileType())
                .mimeType(attachment.getMimeType())
                .isImage(isImage)
                .uploadedBy(mapToUserSimpleDTO(attachment.getUploadedBy()))
                .createdAt(attachment.getCreatedAt())
                .canDelete(canDelete)
                .build();
    }

    /**
     * Map User sang UserSimpleDTO
     */
    private UserSimpleDTO mapToUserSimpleDTO(User user) {
        return UserSimpleDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }

    /**
     * Format file size to human readable
     */
    private String formatFileSize(Long bytes) {
        if (bytes == null || bytes == 0) return "0 B";

        String[] units = {"B", "KB", "MB", "GB"};
        int unitIndex = 0;
        double size = bytes.doubleValue();

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return String.format("%.2f %s", size, units[unitIndex]);
    }

    /**
     * Get file extension from filename
     */
    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }

    /**
     * Check if file type is allowed
     * FR-6.4: Support PDF, DOC, DOCX, XLS, XLSX, images
     */
    private boolean isAllowedFileType(String fileType) {
        List<String> allowed = Arrays.asList(allowedFileTypes.split(","));
        return allowed.contains(fileType.toLowerCase());
    }
}