-- ============================================================
--  EmailTrackingApp — Pending Migrations
--  Run ONCE against AlgoAPM before deploying the feature/enhancements build.
--  All changes use backward-compatible defaults so existing rows are unaffected.
-- ============================================================

-- ── 1. Flag-for-review column on Companies ─────────────────
--  Allows employees to signal a record is ready for admin review.
--  Existing rows default to 0 (not flagged).
ALTER TABLE Companies
    ADD IsReadyForReview BIT NOT NULL DEFAULT 0;
GO

-- ── 2. Prospects table ─────────────────────────────────────
--  Pipeline tracking for agents / direct clients being actively pursued.
CREATE TABLE Prospects (
    Id               INT           PRIMARY KEY IDENTITY(1,1),
    ProspectName     NVARCHAR(255) NOT NULL,
    ContactPerson    NVARCHAR(255) NULL,
    ContactEmail     NVARCHAR(500) NULL,
    ContactPhone     NVARCHAR(100) NULL,
    Source           NVARCHAR(100) NULL,
    Status           NVARCHAR(100) NOT NULL DEFAULT 'First Meeting',
    Notes            NVARCHAR(MAX) NULL,
    NextAction       NVARCHAR(500) NULL,
    NextActionDate   DATETIME      NULL,
    AssignedToUserId INT           NULL,
    CreatedByUserId  INT           NOT NULL,
    CreatedAt        DATETIME      NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt        DATETIME      NOT NULL DEFAULT GETUTCDATE(),

    CONSTRAINT FK_Prospects_AssignedTo
        FOREIGN KEY (AssignedToUserId) REFERENCES Users(Id) ON DELETE SET NULL,
    CONSTRAINT FK_Prospects_CreatedBy
        FOREIGN KEY (CreatedByUserId)  REFERENCES Users(Id)
);
GO

CREATE INDEX IX_Prospects_AssignedTo ON Prospects(AssignedToUserId);
CREATE INDEX IX_Prospects_Status     ON Prospects(Status);
GO

-- ── 3. ProspectType + ReferredBy ───────────────────────────
--  Distinguishes Agent vs Direct Client prospects and captures who referred them.
--  Existing Prospects rows (if any) default to 'Direct Client' / NULL.
ALTER TABLE Prospects
    ADD ProspectType NVARCHAR(50)  NOT NULL DEFAULT 'Direct Client';
GO

ALTER TABLE Prospects
    ADD ReferredBy   NVARCHAR(255) NULL;
GO

-- ── 4. ActivityLog table ────────────────────────────────────
--  Audit trail for key actions on Company and Prospect records.
CREATE TABLE ActivityLog (
    Id         INT           PRIMARY KEY IDENTITY(1,1),
    EntityType NVARCHAR(20)  NOT NULL,   -- 'Company' or 'Prospect'
    EntityId   INT           NOT NULL,
    UserId     INT           NOT NULL,
    Action     NVARCHAR(500) NOT NULL,
    CreatedAt  DATETIME      NOT NULL DEFAULT GETUTCDATE(),

    CONSTRAINT FK_ActivityLog_Users
        FOREIGN KEY (UserId) REFERENCES Users(Id)
);
GO

CREATE INDEX IX_ActivityLog_Entity ON ActivityLog(EntityType, EntityId);
GO
