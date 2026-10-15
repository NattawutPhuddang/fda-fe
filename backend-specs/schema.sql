-- ====================================================================================================
-- ระบบสารสนเทศฉลากดิจิทัล สำนักงานคณะกรรมการอาหารและยา (อย.) กระทรวงสาธารณสุข
-- Thai FDA Digital Labeling Platform - Database Schema (Microsoft SQL Server 2022)
-- ====================================================================================================

-- 1. Users Table
CREATE TABLE [dbo].[Users] (
    [UserId] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    [Username] NVARCHAR(100) NOT NULL,
    [FullName] NVARCHAR(200) NOT NULL,
    [Email] NVARCHAR(255) NOT NULL,
    [PhoneNumber] NVARCHAR(50) NULL,
    [Role] NVARCHAR(50) NOT NULL,
    [Department] NVARCHAR(200) NULL,
    [Organization] NVARCHAR(255) NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [LastLoginAt] DATETIMEOFFSET NULL,
    [CreatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    [UpdatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    [IsDeleted] BIT NOT NULL DEFAULT 0,
    CONSTRAINT [PK_Users] PRIMARY KEY CLUSTERED ([UserId] ASC),
    CONSTRAINT [UQ_Users_Username] UNIQUE NONCLUSTERED ([Username] ASC),
    CONSTRAINT [UQ_Users_Email] UNIQUE NONCLUSTERED ([Email] ASC)
);

-- 2. Roles Table
CREATE TABLE [dbo].[Roles] (
    [RoleId] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    [RoleName] NVARCHAR(50) NOT NULL,
    [Description] NVARCHAR(255) NULL,
    [IsSystemRole] BIT NOT NULL DEFAULT 1,
    [CreatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT [PK_Roles] PRIMARY KEY CLUSTERED ([RoleId] ASC),
    CONSTRAINT [UQ_Roles_RoleName] UNIQUE NONCLUSTERED ([RoleName] ASC)
);

-- 3. Permissions Table
CREATE TABLE [dbo].[Permissions] (
    [PermissionId] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    [PermissionCode] NVARCHAR(100) NOT NULL,
    [Description] NVARCHAR(255) NULL,
    [Module] NVARCHAR(50) NOT NULL,
    CONSTRAINT [PK_Permissions] PRIMARY KEY CLUSTERED ([PermissionId] ASC),
    CONSTRAINT [UQ_Permissions_Code] UNIQUE NONCLUSTERED ([PermissionCode] ASC)
);

-- 4. UserRoles Table
CREATE TABLE [dbo].[UserRoles] (
    [UserId] UNIQUEIDENTIFIER NOT NULL,
    [RoleId] UNIQUEIDENTIFIER NOT NULL,
    [AssignedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT [PK_UserRoles] PRIMARY KEY CLUSTERED ([UserId] ASC, [RoleId] ASC),
    CONSTRAINT [FK_UserRoles_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([UserId]) ON DELETE CASCADE,
    CONSTRAINT [FK_UserRoles_Roles] FOREIGN KEY ([RoleId]) REFERENCES [dbo].[Roles] ([RoleId]) ON DELETE CASCADE
);

-- 5. RolePermissions Table
CREATE TABLE [dbo].[RolePermissions] (
    [RoleId] UNIQUEIDENTIFIER NOT NULL,
    [PermissionId] UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT [PK_RolePermissions] PRIMARY KEY CLUSTERED ([RoleId] ASC, [PermissionId] ASC),
    CONSTRAINT [FK_RolePermissions_Roles] FOREIGN KEY ([RoleId]) REFERENCES [dbo].[Roles] ([RoleId]) ON DELETE CASCADE,
    CONSTRAINT [FK_RolePermissions_Permissions] FOREIGN KEY ([PermissionId]) REFERENCES [dbo].[Permissions] ([PermissionId]) ON DELETE CASCADE
);

-- 6. ProductCategories Table
CREATE TABLE [dbo].[ProductCategories] (
    [CategoryId] NVARCHAR(50) NOT NULL,
    [CategoryNameTh] NVARCHAR(200) NOT NULL,
    [CategoryNameEn] NVARCHAR(200) NOT NULL,
    [RegPrefix] NVARCHAR(20) NOT NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    CONSTRAINT [PK_ProductCategories] PRIMARY KEY CLUSTERED ([CategoryId] ASC)
);

-- 7. Entrepreneurs Table
CREATE TABLE [dbo].[Entrepreneurs] (
    [EntrepreneurId] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    [TaxId] NVARCHAR(20) NOT NULL,
    [CompanyNameTh] NVARCHAR(255) NOT NULL,
    [CompanyNameEn] NVARCHAR(255) NULL,
    [RegisteredAddress] NVARCHAR(500) NOT NULL,
    [DbdVerified] BIT NOT NULL DEFAULT 0,
    [CreatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT [PK_Entrepreneurs] PRIMARY KEY CLUSTERED ([EntrepreneurId] ASC),
    CONSTRAINT [UQ_Entrepreneurs_TaxId] UNIQUE NONCLUSTERED ([TaxId] ASC)
);

-- 8. EntrepreneurRepresentatives Table
CREATE TABLE [dbo].[EntrepreneurRepresentatives] (
    [RepresentativeId] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    [EntrepreneurId] UNIQUEIDENTIFIER NOT NULL,
    [FullName] NVARCHAR(200) NOT NULL,
    [IdCardNumber] NVARCHAR(20) NOT NULL,
    [Email] NVARCHAR(255) NOT NULL,
    [PhoneNumber] NVARCHAR(50) NULL,
    [ScopeOfAuthority] NVARCHAR(MAX) NOT NULL,
    [StartDate] DATE NOT NULL,
    [EndDate] DATE NOT NULL,
    [Status] NVARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    [CreatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT [PK_EntrepreneurRepresentatives] PRIMARY KEY CLUSTERED ([RepresentativeId] ASC),
    CONSTRAINT [FK_EntrepreneurRepresentatives_Entrepreneurs] FOREIGN KEY ([EntrepreneurId]) REFERENCES [dbo].[Entrepreneurs] ([EntrepreneurId])
);

-- 9. Products Table (Master Reference synchronized from e-Submission)
CREATE TABLE [dbo].[Products] (
    [ProductId] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    [Newcode] NVARCHAR(50) NOT NULL,
    [RegNumber] NVARCHAR(50) NOT NULL,
    [ProductNameTh] NVARCHAR(300) NOT NULL,
    [ProductNameEn] NVARCHAR(300) NULL,
    [CategoryId] NVARCHAR(50) NOT NULL,
    [EntrepreneurId] UNIQUEIDENTIFIER NOT NULL,
    [ManufacturerName] NVARCHAR(300) NOT NULL,
    [ManufacturerAddress] NVARCHAR(500) NOT NULL,
    [ApprovedDate] DATE NOT NULL,
    [ExpiryDate] DATE NOT NULL,
    [RegistrationStatus] NVARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    [LastSyncedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    [ESubmissionRef] NVARCHAR(100) NOT NULL,
    [IsDeleted] BIT NOT NULL DEFAULT 0,
    CONSTRAINT [PK_Products] PRIMARY KEY CLUSTERED ([ProductId] ASC),
    CONSTRAINT [UQ_Products_Newcode] UNIQUE NONCLUSTERED ([Newcode] ASC),
    CONSTRAINT [UQ_Products_RegNumber] UNIQUE NONCLUSTERED ([RegNumber] ASC),
    CONSTRAINT [FK_Products_Categories] FOREIGN KEY ([CategoryId]) REFERENCES [dbo].[ProductCategories] ([CategoryId]),
    CONSTRAINT [FK_Products_Entrepreneurs] FOREIGN KEY ([EntrepreneurId]) REFERENCES [dbo].[Entrepreneurs] ([EntrepreneurId])
);

-- 10. ProductAuthorizations Table
CREATE TABLE [dbo].[ProductAuthorizations] (
    [AuthorizationId] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    [ProductId] UNIQUEIDENTIFIER NOT NULL,
    [RepresentativeId] UNIQUEIDENTIFIER NOT NULL,
    [AssignedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT [PK_ProductAuthorizations] PRIMARY KEY CLUSTERED ([AuthorizationId] ASC),
    CONSTRAINT [FK_ProductAuthorizations_Products] FOREIGN KEY ([ProductId]) REFERENCES [dbo].[Products] ([ProductId]),
    CONSTRAINT [FK_ProductAuthorizations_Reps] FOREIGN KEY ([RepresentativeId]) REFERENCES [dbo].[EntrepreneurRepresentatives] ([RepresentativeId])
);

-- 11. DigitalLabels Table
CREATE TABLE [dbo].[DigitalLabels] (
    [LabelId] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    [ProductId] UNIQUEIDENTIFIER NOT NULL,
    [CurrentVersion] INT NOT NULL DEFAULT 1,
    [Status] NVARCHAR(50) NOT NULL DEFAULT 'draft',
    [TitleTh] NVARCHAR(300) NOT NULL,
    [TitleEn] NVARCHAR(300) NULL,
    [DescriptionTh] NVARCHAR(MAX) NULL,
    [DescriptionEn] NVARCHAR(MAX) NULL,
    [ImageUrl] NVARCHAR(500) NULL,
    [GeneralWarningTh] NVARCHAR(MAX) NULL,
    [GeneralWarningEn] NVARCHAR(MAX) NULL,
    [StorageWarningTh] NVARCHAR(MAX) NULL,
    [StorageWarningEn] NVARCHAR(MAX) NULL,
    [ScanCount] BIGINT NOT NULL DEFAULT 0,
    [SuspendedReason] NVARCHAR(MAX) NULL,
    [RevisionNotes] NVARCHAR(MAX) NULL,
    [CurrentOfficerId] UNIQUEIDENTIFIER NULL,
    [SubmittedAt] DATETIMEOFFSET NULL,
    [ApprovedAt] DATETIMEOFFSET NULL,
    [PublishedAt] DATETIMEOFFSET NULL,
    [CreatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    [UpdatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    [IsDeleted] BIT NOT NULL DEFAULT 0,
    CONSTRAINT [PK_DigitalLabels] PRIMARY KEY CLUSTERED ([LabelId] ASC),
    CONSTRAINT [FK_DigitalLabels_Products] FOREIGN KEY ([ProductId]) REFERENCES [dbo].[Products] ([ProductId]),
    CONSTRAINT [FK_DigitalLabels_Officer] FOREIGN KEY ([CurrentOfficerId]) REFERENCES [dbo].[Users] ([UserId])
);

-- 12. DigitalLabelVersions Table
CREATE TABLE [dbo].[DigitalLabelVersions] (
    [VersionId] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    [LabelId] UNIQUEIDENTIFIER NOT NULL,
    [VersionNumber] INT NOT NULL,
    [SnapshotJson] NVARCHAR(MAX) NOT NULL,
    [ChangedByUserId] UNIQUEIDENTIFIER NOT NULL,
    [CreatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT [PK_DigitalLabelVersions] PRIMARY KEY CLUSTERED ([VersionId] ASC),
    CONSTRAINT [FK_DigitalLabelVersions_Labels] FOREIGN KEY ([LabelId]) REFERENCES [dbo].[DigitalLabels] ([LabelId]) ON DELETE CASCADE
);

-- 13. DigitalLabelTranslations Table
CREATE TABLE [dbo].[DigitalLabelTranslations] (
    [TranslationId] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    [LabelId] UNIQUEIDENTIFIER NOT NULL,
    [LanguageCode] NVARCHAR(10) NOT NULL, -- 'th', 'en'
    [FieldKey] NVARCHAR(100) NOT NULL,
    [TranslationValue] NVARCHAR(MAX) NOT NULL,
    CONSTRAINT [PK_DigitalLabelTranslations] PRIMARY KEY CLUSTERED ([TranslationId] ASC),
    CONSTRAINT [FK_DigitalLabelTranslations_Labels] FOREIGN KEY ([LabelId]) REFERENCES [dbo].[DigitalLabels] ([LabelId]) ON DELETE CASCADE
);

-- 14. DigitalLabelDocuments Table
CREATE TABLE [dbo].[DigitalLabelDocuments] (
    [DocumentId] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    [LabelId] UNIQUEIDENTIFIER NOT NULL,
    [FileName] NVARCHAR(255) NOT NULL,
    [FileUrl] NVARCHAR(500) NOT NULL,
    [ContentType] NVARCHAR(100) NOT NULL,
    [FileSize] NVARCHAR(50) NOT NULL,
    [UploadedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT [PK_DigitalLabelDocuments] PRIMARY KEY CLUSTERED ([DocumentId] ASC),
    CONSTRAINT [FK_DigitalLabelDocuments_Labels] FOREIGN KEY ([LabelId]) REFERENCES [dbo].[DigitalLabels] ([LabelId]) ON DELETE CASCADE
);

-- 15. LabelRequests Table
CREATE TABLE [dbo].[LabelRequests] (
    [RequestId] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    [LabelId] UNIQUEIDENTIFIER NOT NULL,
    [EntrepreneurId] UNIQUEIDENTIFIER NOT NULL,
    [RequestType] NVARCHAR(50) NOT NULL DEFAULT 'NEW_LABEL',
    [Status] NVARCHAR(50) NOT NULL DEFAULT 'PENDING',
    [SubmittedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    [AssignedOfficerId] UNIQUEIDENTIFIER NULL,
    CONSTRAINT [PK_LabelRequests] PRIMARY KEY CLUSTERED ([RequestId] ASC),
    CONSTRAINT [FK_LabelRequests_Labels] FOREIGN KEY ([LabelId]) REFERENCES [dbo].[DigitalLabels] ([LabelId]),
    CONSTRAINT [FK_LabelRequests_Officer] FOREIGN KEY ([AssignedOfficerId]) REFERENCES [dbo].[Users] ([UserId])
);

-- 16. LabelReviews Table
CREATE TABLE [dbo].[LabelReviews] (
    [ReviewId] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    [RequestId] UNIQUEIDENTIFIER NOT NULL,
    [OfficerId] UNIQUEIDENTIFIER NOT NULL,
    [ReviewAction] NVARCHAR(50) NOT NULL, -- APPROVE, REVISION, REJECT, SUSPEND
    [Notes] NVARCHAR(MAX) NULL,
    [ReviewedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT [PK_LabelReviews] PRIMARY KEY CLUSTERED ([ReviewId] ASC),
    CONSTRAINT [FK_LabelReviews_Requests] FOREIGN KEY ([RequestId]) REFERENCES [dbo].[LabelRequests] ([RequestId]),
    CONSTRAINT [FK_LabelReviews_Officer] FOREIGN KEY ([OfficerId]) REFERENCES [dbo].[Users] ([UserId])
);

-- 17. ReviewChecklists Table
CREATE TABLE [dbo].[ReviewChecklists] (
    [ChecklistId] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    [ReviewId] UNIQUEIDENTIFIER NOT NULL,
    [ItemCode] NVARCHAR(50) NOT NULL,
    [Title] NVARCHAR(255) NOT NULL,
    [Passed] BIT NOT NULL DEFAULT 0,
    [Notes] NVARCHAR(MAX) NULL,
    CONSTRAINT [PK_ReviewChecklists] PRIMARY KEY CLUSTERED ([ChecklistId] ASC),
    CONSTRAINT [FK_ReviewChecklists_Reviews] FOREIGN KEY ([ReviewId]) REFERENCES [dbo].[LabelReviews] ([ReviewId]) ON DELETE CASCADE
);

-- 18. QRCodeRecords Table
CREATE TABLE [dbo].[QRCodeRecords] (
    [QRCodeId] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    [ProductId] UNIQUEIDENTIFIER NOT NULL,
    [LabelId] UNIQUEIDENTIFIER NOT NULL,
    [PublicUrl] NVARCHAR(500) NOT NULL,
    [SvgContent] NVARCHAR(MAX) NULL,
    [CorrectionLevel] NVARCHAR(5) NOT NULL DEFAULT 'M',
    [CreatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT [PK_QRCodeRecords] PRIMARY KEY CLUSTERED ([QRCodeId] ASC),
    CONSTRAINT [FK_QRCodeRecords_Products] FOREIGN KEY ([ProductId]) REFERENCES [dbo].[Products] ([ProductId]),
    CONSTRAINT [FK_QRCodeRecords_Labels] FOREIGN KEY ([LabelId]) REFERENCES [dbo].[DigitalLabels] ([LabelId])
);

-- 19. QRScanEvents Table
CREATE TABLE [dbo].[QRScanEvents] (
    [ScanId] BIGINT IDENTITY(1,1) NOT NULL,
    [LabelId] UNIQUEIDENTIFIER NOT NULL,
    [ScannedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    [DeviceType] NVARCHAR(50) NOT NULL,
    [BrowserName] NVARCHAR(100) NOT NULL,
    [ProvinceRegion] NVARCHAR(100) NULL,
    [IpHash] NVARCHAR(64) NULL, -- Hashed IP to protect privacy
    CONSTRAINT [PK_QRScanEvents] PRIMARY KEY CLUSTERED ([ScanId] ASC),
    CONSTRAINT [FK_QRScanEvents_Labels] FOREIGN KEY ([LabelId]) REFERENCES [dbo].[DigitalLabels] ([LabelId])
);

-- 20. Notifications Table
CREATE TABLE [dbo].[Notifications] (
    [NotificationId] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    [UserId] UNIQUEIDENTIFIER NOT NULL,
    [Title] NVARCHAR(200) NOT NULL,
    [Message] NVARCHAR(MAX) NOT NULL,
    [IsRead] BIT NOT NULL DEFAULT 0,
    [CreatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT [PK_Notifications] PRIMARY KEY CLUSTERED ([NotificationId] ASC),
    CONSTRAINT [FK_Notifications_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([UserId])
);

-- 21. AuditLogs Table (Append-Only)
CREATE TABLE [dbo].[AuditLogs] (
    [AuditLogId] BIGINT IDENTITY(1,1) NOT NULL,
    [EventId] NVARCHAR(100) NOT NULL,
    [Timestamp] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    [UserId] UNIQUEIDENTIFIER NULL,
    [UserName] NVARCHAR(200) NOT NULL,
    [UserRole] NVARCHAR(50) NOT NULL,
    [Action] NVARCHAR(100) NOT NULL,
    [ResourceType] NVARCHAR(100) NOT NULL,
    [ResourceId] NVARCHAR(100) NOT NULL,
    [Result] NVARCHAR(20) NOT NULL,
    [IpAddress] NVARCHAR(50) NOT NULL,
    [CorrelationId] NVARCHAR(100) NOT NULL,
    [Details] NVARCHAR(MAX) NULL,
    CONSTRAINT [PK_AuditLogs] PRIMARY KEY CLUSTERED ([AuditLogId] ASC)
);

-- 22. LabelFieldDefinitions Table
CREATE TABLE [dbo].[LabelFieldDefinitions] (
    [FieldId] NVARCHAR(50) NOT NULL,
    [CategoryId] NVARCHAR(50) NOT NULL,
    [FieldNameTh] NVARCHAR(200) NOT NULL,
    [FieldNameEn] NVARCHAR(200) NOT NULL,
    [DataType] NVARCHAR(50) NOT NULL,
    [IsMandatory] BIT NOT NULL DEFAULT 0,
    CONSTRAINT [PK_LabelFieldDefinitions] PRIMARY KEY CLUSTERED ([FieldId] ASC),
    CONSTRAINT [FK_LabelFieldDefinitions_Categories] FOREIGN KEY ([CategoryId]) REFERENCES [dbo].[ProductCategories] ([CategoryId])
);

-- 23. IntegrationConfigurations Table
CREATE TABLE [dbo].[IntegrationConfigurations] (
    [ConfigId] NVARCHAR(50) NOT NULL,
    [ServiceName] NVARCHAR(100) NOT NULL,
    [EndpointUrl] NVARCHAR(500) NOT NULL,
    [AuthMethod] NVARCHAR(50) NOT NULL,
    [Status] NVARCHAR(50) NOT NULL DEFAULT 'PLACEHOLDER',
    [LastSyncAt] DATETIMEOFFSET NULL,
    [ErrorMessage] NVARCHAR(MAX) NULL,
    [IsMock] BIT NOT NULL DEFAULT 1,
    CONSTRAINT [PK_IntegrationConfigurations] PRIMARY KEY CLUSTERED ([ConfigId] ASC)
);

-- 24. SyncJobs Table
CREATE TABLE [dbo].[SyncJobs] (
    [JobId] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    [JobName] NVARCHAR(100) NOT NULL,
    [StartedAt] DATETIMEOFFSET NOT NULL,
    [FinishedAt] DATETIMEOFFSET NULL,
    [Status] NVARCHAR(20) NOT NULL,
    [RecordsProcessed] INT NOT NULL DEFAULT 0,
    [ErrorMessage] NVARCHAR(MAX) NULL,
    CONSTRAINT [PK_SyncJobs] PRIMARY KEY CLUSTERED ([JobId] ASC)
);

-- 25. SystemSettings Table
CREATE TABLE [dbo].[SystemSettings] (
    [SettingKey] NVARCHAR(100) NOT NULL,
    [SettingValue] NVARCHAR(MAX) NOT NULL,
    [Description] NVARCHAR(255) NULL,
    [UpdatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT [PK_SystemSettings] PRIMARY KEY CLUSTERED ([SettingKey] ASC)
);

-- ====================================================================================================
-- Performance Indexes for Public Verification & High-Traffic QR Scans
-- ====================================================================================================
CREATE NONCLUSTERED INDEX [IX_Products_Newcode_Status] ON [dbo].[Products] ([Newcode], [RegistrationStatus]);
CREATE NONCLUSTERED INDEX [IX_DigitalLabels_ProductId_Status] ON [dbo].[DigitalLabels] ([ProductId], [Status]);
CREATE NONCLUSTERED INDEX [IX_QRScanEvents_LabelId_Timestamp] ON [dbo].[QRScanEvents] ([LabelId], [ScannedAt] DESC);
CREATE NONCLUSTERED INDEX [IX_AuditLogs_Timestamp_Action] ON [dbo].[AuditLogs] ([Timestamp] DESC, [Action]);
CREATE NONCLUSTERED INDEX [IX_AuditLogs_CorrelationId] ON [dbo].[AuditLogs] ([CorrelationId]);
