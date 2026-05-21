-- Fix Database Schema - Remove extra columns from Companies table
-- This script will drop the existing Companies table and recreate it correctly

-- Drop existing Companies table (this will cascade due to foreign key)
DROP TABLE IF EXISTS [Companies];

-- Recreate Companies Table with correct schema
CREATE TABLE [Companies]
(
    [Id] INT PRIMARY KEY IDENTITY(1,1),
    [CompanyName] NVARCHAR(255) NOT NULL,
    [Region] NVARCHAR(100) NOT NULL,
    [Link] NVARCHAR(MAX) NULL,
    [Emails] NVARCHAR(MAX) NOT NULL,
    [PainPoints] NVARCHAR(MAX) NULL,
    [ExactNeeds] NVARCHAR(MAX) NULL,
    [BuyingTrigger] NVARCHAR(MAX) NULL,
    [BestPitchAngle] NVARCHAR(MAX) NULL,
    [WhyStrongFit] NVARCHAR(MAX) NULL,
    [Status] NVARCHAR(50) NOT NULL DEFAULT 'Not Sent',
    [UserId] INT NOT NULL,
    [CreatedAt] DATETIME NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] DATETIME NOT NULL DEFAULT GETUTCDATE(),
    [LastEmailSentAt] DATETIME NULL,
    CONSTRAINT [FK_Companies_Users] FOREIGN KEY ([UserId]) REFERENCES [Users]([Id]) ON DELETE CASCADE
);

-- Create Index on UserId for better query performance
CREATE INDEX [IX_Companies_UserId] ON [Companies]([UserId]);

-- Create Index on CompanyName and UserId for duplicate check
CREATE INDEX [IX_Companies_CompanyName_UserId] ON [Companies]([CompanyName], [UserId]);

-- Optional: Re-insert sample data
INSERT INTO [Companies] ([CompanyName], [Region], [Link], [Emails], [Status], [UserId])
VALUES 
    ('TechCorp', 'North America', 'https://techcorp.com', 'contact@techcorp.com', 'Not Sent', 2),
    ('Global Solutions', 'Europe', 'https://globalsolutions.com', 'info@globalsolutions.com;support@globalsolutions.com', 'Not Sent', 2),
    ('Innovation Labs', 'Asia', 'https://innovationlabs.com', 'hello@innovationlabs.com', 'Pending', 3);

PRINT 'Companies table has been recreated successfully!';
