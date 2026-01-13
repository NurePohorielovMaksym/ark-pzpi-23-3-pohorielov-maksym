/* 1. СТВОРЕННЯ БАЗИ ТА КОРИСТУВАЧА */
IF NOT EXISTS(SELECT * FROM sys.databases WHERE name = 'FeedMate')
BEGIN
    CREATE DATABASE FeedMate;
END
GO

USE FeedMate;
GO

IF NOT EXISTS(SELECT * FROM sys.server_principals WHERE name = 'collectifyuser')
BEGIN
    CREATE LOGIN collectifyuser WITH PASSWORD = 'StrongPassword123', CHECK_POLICY = OFF;
END
GO

IF NOT EXISTS(SELECT * FROM sys.database_principals WHERE name = 'collectifyuser')
BEGIN
    CREATE USER collectifyuser FOR LOGIN collectifyuser;
    ALTER ROLE db_owner ADD MEMBER collectifyuser;
END
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='USERS' AND xtype='U')
CREATE TABLE [dbo].[USERS](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[email] [nvarchar](255) NOT NULL,
	[passwordHash] [nvarchar](255) NOT NULL,
	[fullName] [nvarchar](200) NULL,
	[createdAt] [datetime2](7) NOT NULL DEFAULT (sysutcdatetime()),
	[role] [nvarchar](30) NULL,
PRIMARY KEY CLUSTERED ([id] ASC),
UNIQUE NONCLUSTERED ([email] ASC)
);
GO
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CHK_UserRole')
ALTER TABLE [dbo].[USERS] WITH CHECK ADD CONSTRAINT [CHK_UserRole] CHECK (([role]='admin' OR [role]='user'));
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='FEEDING_PLANS' AND xtype='U')
CREATE TABLE [dbo].[FEEDING_PLANS](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[userId] [int] NOT NULL,
	[name] [nvarchar](100) NOT NULL,
	[description] [nvarchar](255) NULL,
	[createdAt] [datetime2](7) NOT NULL DEFAULT (sysutcdatetime()),
PRIMARY KEY CLUSTERED ([id] ASC)
);
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_PLANS_USERS')
ALTER TABLE [dbo].[FEEDING_PLANS] WITH CHECK ADD CONSTRAINT [FK_PLANS_USERS] FOREIGN KEY([userId])
REFERENCES [dbo].[USERS] ([id])
ON DELETE CASCADE;
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='DEVICES' AND xtype='U')
CREATE TABLE [dbo].[DEVICES](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[userId] [int] NOT NULL,
	[serial] [nvarchar](100) NOT NULL,
	[name] [nvarchar](100) NULL,
	[apiKeyHash] [nvarchar](255) NOT NULL,
	[lastSeenAt] [datetime2](7) NULL,
	[capacity] [nvarchar](50) NULL,
	[isConnected] [bit] NULL DEFAULT ((0)),
PRIMARY KEY CLUSTERED ([id] ASC),
UNIQUE NONCLUSTERED ([serial] ASC)
);
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_DEVICES_USERS')
ALTER TABLE [dbo].[DEVICES] WITH CHECK ADD CONSTRAINT [FK_DEVICES_USERS] FOREIGN KEY([userId])
REFERENCES [dbo].[USERS] ([id])
ON DELETE CASCADE;
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='PETS' AND xtype='U')
CREATE TABLE [dbo].[PETS](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[userId] [int] NOT NULL,
	[name] [nvarchar](100) NOT NULL,
	[photoUrl] [nvarchar](500) NULL,
	[foodType] [nvarchar](100) NULL,
	[recommendedPortionGrams] [int] NULL,
	[feedingPlanId] [int] NULL,
	[type] [nvarchar](50) NULL,
	[weight] [nvarchar](50) NULL,
	[birthDate] [nvarchar](50) NULL,
	[breed] [nvarchar](50) NULL,
	[activity] [nvarchar](100) NULL,
PRIMARY KEY CLUSTERED ([id] ASC)
);
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_PETS_FEEDING_PLANS')
ALTER TABLE [dbo].[PETS] WITH CHECK ADD CONSTRAINT [FK_PETS_FEEDING_PLANS] FOREIGN KEY([feedingPlanId])
REFERENCES [dbo].[FEEDING_PLANS] ([id]);
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_PETS_USERS')
ALTER TABLE [dbo].[PETS] WITH CHECK ADD CONSTRAINT [FK_PETS_USERS] FOREIGN KEY([userId])
REFERENCES [dbo].[USERS] ([id])
ON DELETE CASCADE;
GO

IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CHK_Activity_Valid')
ALTER TABLE [dbo].[PETS] WITH CHECK ADD CONSTRAINT [CHK_Activity_Valid] CHECK (([activity]='high' OR [activity]='medium' OR [activity]='low'));
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='FEEDING_SCHEDULES' AND xtype='U')
CREATE TABLE [dbo].[FEEDING_SCHEDULES](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[feedTime] [time](7) NOT NULL,
	[portionGrams] [int] NOT NULL,
	[mode] [nvarchar](30) NOT NULL,
	[enabled] [bit] NOT NULL DEFAULT ((1)),
	[planId] [int] NULL,
PRIMARY KEY CLUSTERED ([id] ASC)
);
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_FEEDING_SCHEDULES_PLANS')
ALTER TABLE [dbo].[FEEDING_SCHEDULES] WITH CHECK ADD CONSTRAINT [FK_FEEDING_SCHEDULES_PLANS] FOREIGN KEY([planId])
REFERENCES [dbo].[FEEDING_PLANS] ([id])
ON DELETE CASCADE;
GO

IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CHK_Mode_Valid') -- Дав ім'я констрейнту, щоб не було конфліктів
ALTER TABLE [dbo].[FEEDING_SCHEDULES] WITH CHECK ADD CONSTRAINT [CHK_Mode_Valid] CHECK (([mode]='MANUAL_ALLOWED' OR [mode]='AUTO'));
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='DEVICE_NOTIFICATIONS' AND xtype='U')
CREATE TABLE [dbo].[DEVICE_NOTIFICATIONS](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[deviceId] [int] NOT NULL,
	[createdAt] [datetime2](7) NOT NULL DEFAULT (sysutcdatetime()),
	[type] [nvarchar](30) NOT NULL,
	[message] [nvarchar](500) NOT NULL,
	[isRead] [bit] NOT NULL DEFAULT ((0)),
PRIMARY KEY CLUSTERED ([id] ASC)
);
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_DEVICE_NOTIFICATIONS_DEVICES')
ALTER TABLE [dbo].[DEVICE_NOTIFICATIONS] WITH CHECK ADD CONSTRAINT [FK_DEVICE_NOTIFICATIONS_DEVICES] FOREIGN KEY([deviceId])
REFERENCES [dbo].[DEVICES] ([id])
ON DELETE CASCADE;
GO

IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CHK_NotificationType')
ALTER TABLE [dbo].[DEVICE_NOTIFICATIONS] WITH CHECK ADD CONSTRAINT [CHK_NotificationType] CHECK (([type]='ERROR' OR [type]='LOW_FOOD'));
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='DEVICE_STATUSES' AND xtype='U')
CREATE TABLE [dbo].[DEVICE_STATUSES](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[deviceId] [int] NOT NULL,
	[reportedAt] [datetime2](7) NOT NULL DEFAULT (sysutcdatetime()),
	[foodLevelPercent] [int] NULL,
	[status] [nvarchar](30) NOT NULL,
	[foodLevel] [int] NULL,
PRIMARY KEY CLUSTERED ([id] ASC)
);
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_STATUSES_DEVICES')
ALTER TABLE [dbo].[DEVICE_STATUSES] WITH CHECK ADD CONSTRAINT [FK_STATUSES_DEVICES] FOREIGN KEY([deviceId])
REFERENCES [dbo].[DEVICES] ([id])
ON DELETE CASCADE;
GO

IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CHK_FoodLevel')
ALTER TABLE [dbo].[DEVICE_STATUSES] WITH CHECK ADD CONSTRAINT [CHK_FoodLevel] CHECK (([foodLevelPercent]>=(0) AND [foodLevelPercent]<=(100)));
GO

IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CHK_DeviceStatus')
ALTER TABLE [dbo].[DEVICE_STATUSES] WITH CHECK ADD CONSTRAINT [CHK_DeviceStatus] CHECK (([status]='OFFLINE' OR [status]='JAM' OR [status]='LOW_FOOD' OR [status]='OK'));
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='FEEDING_EVENTS' AND xtype='U')
CREATE TABLE [dbo].[FEEDING_EVENTS](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[petId] [int] NOT NULL,
	[deviceId] [int] NOT NULL,
	[fedAt] [datetime2](7) NOT NULL DEFAULT (sysutcdatetime()),
	[portionGrams] [int] NOT NULL,
	[source] [nvarchar](30) NOT NULL,
	[result] [nvarchar](20) NOT NULL,
	[foodType] [nvarchar](50) NULL,
PRIMARY KEY CLUSTERED ([id] ASC)
);
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_EVENTS_DEVICES')
ALTER TABLE [dbo].[FEEDING_EVENTS] WITH CHECK ADD CONSTRAINT [FK_EVENTS_DEVICES] FOREIGN KEY([deviceId])
REFERENCES [dbo].[DEVICES] ([id]);
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_EVENTS_PETS')
ALTER TABLE [dbo].[FEEDING_EVENTS] WITH CHECK ADD CONSTRAINT [FK_EVENTS_PETS] FOREIGN KEY([petId])
REFERENCES [dbo].[PETS] ([id])
ON DELETE CASCADE;
GO

IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CHK_FoodType_Valid')
ALTER TABLE [dbo].[FEEDING_EVENTS] WITH CHECK ADD CONSTRAINT [CHK_FoodType_Valid] CHECK (([foodType]='Wet' OR [foodType]='Dry'));
GO

IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CHK_Result_Valid')
ALTER TABLE [dbo].[FEEDING_EVENTS] WITH CHECK ADD CONSTRAINT [CHK_Result_Valid] CHECK (([result]='FAILED' OR [result]='OK'));
GO

IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CHK_Source_Valid')
ALTER TABLE [dbo].[FEEDING_EVENTS] WITH CHECK ADD CONSTRAINT [CHK_Source_Valid] CHECK (([source]='MANUAL_BUTTON' OR [source]='MANUAL_APP' OR [source]='AUTO'));
GO