CREATE TABLE `auditEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productRecordId` varchar(96) NOT NULL,
	`fieldKey` varchar(120),
	`action` varchar(100) NOT NULL,
	`originalValue` text,
	`proposedValue` text,
	`approvedValue` text,
	`actor` varchar(255) NOT NULL DEFAULT 'Reviewer',
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `batchRowErrors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`batchId` varchar(64) NOT NULL,
	`sourceRow` int NOT NULL,
	`mfgPartNum` varchar(255),
	`reason` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `batchRowErrors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fieldApprovals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productRecordId` varchar(96) NOT NULL,
	`fieldKey` varchar(120) NOT NULL,
	`originalValue` text,
	`proposedValue` text,
	`approvedValue` text,
	`status` enum('proposed','approved','edited','flagged') NOT NULL DEFAULT 'proposed',
	`reviewer` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fieldApprovals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `processingBatches` (
	`id` varchar(64) NOT NULL,
	`sourceName` varchar(255) NOT NULL,
	`totalRows` int NOT NULL,
	`processedRows` int NOT NULL DEFAULT 0,
	`failedRows` int NOT NULL DEFAULT 0,
	`status` enum('processing','complete','failed') NOT NULL DEFAULT 'processing',
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`finishedAt` timestamp,
	CONSTRAINT `processingBatches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `productAttributes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productRecordId` varchar(96) NOT NULL,
	`fieldKey` varchar(120) NOT NULL,
	`label` varchar(255) NOT NULL,
	`rawValue` text,
	`normalizedValue` text,
	`unit` varchar(50),
	`isValidated` boolean NOT NULL DEFAULT false,
	`lovMatch` boolean NOT NULL DEFAULT false,
	`confidence` int NOT NULL,
	`evidenceSourceType` varchar(80) NOT NULL,
	`sourceRef` varchar(255) NOT NULL,
	`sourceUrl` text,
	`excerpt` text,
	`extractionMethod` varchar(120) NOT NULL,
	`fieldState` enum('proposed','approved','flagged','needs_review') NOT NULL DEFAULT 'proposed',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `productAttributes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `productRecords` (
	`id` varchar(96) NOT NULL,
	`batchId` varchar(64) NOT NULL,
	`sourceRow` int NOT NULL,
	`mfgPartNum` varchar(255),
	`rawDescription` text NOT NULL,
	`rawManufacturer` varchar(500),
	`rawE1Brand` varchar(255),
	`rawUnilogBrand` varchar(255),
	`rawDibBrand` varchar(255),
	`manufacturer` varchar(255),
	`manufacturerCode` varchar(100),
	`brand` varchar(255),
	`brandCode` varchar(100),
	`matchMethod` varchar(80) NOT NULL,
	`matchScore` int NOT NULL,
	`classpath` varchar(500),
	`recordConfidence` int NOT NULL,
	`reviewStatus` enum('pending','needs_review','approved','flagged') NOT NULL DEFAULT 'pending',
	`processingStatus` enum('processed','failed') NOT NULL DEFAULT 'processed',
	`inputHash` varchar(128) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `productRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `validationIssues` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productRecordId` varchar(96) NOT NULL,
	`fieldKey` varchar(120),
	`severity` enum('pass','warning','fail') NOT NULL,
	`code` varchar(100) NOT NULL,
	`message` text NOT NULL,
	`isResolved` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `validationIssues_id` PRIMARY KEY(`id`)
);
