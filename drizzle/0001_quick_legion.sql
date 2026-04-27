CREATE TABLE `checkpoints` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`description` text,
	`stats_download_count` integer,
	`stats_favorite_count` integer,
	`stats_thumbs_up_count` integer,
	`stats_thumbs_down_count` integer,
	`stats_comment_count` integer,
	`stats_rating_count` integer,
	`stats_rating` real,
	`stats_tipped_amount_count` integer,
	`creator_username` text NOT NULL,
	`tags` text,
	`model_versions` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `images` (
	`id` integer PRIMARY KEY NOT NULL,
	`model_id` integer NOT NULL,
	`version_id` integer NOT NULL,
	`url` text,
	`hash` text,
	`width` integer,
	`height` integer,
	`created_at` integer,
	`post_id` integer,
	`stats_cry_count` integer,
	`stats_laugh_count` integer,
	`stats_like_count` integer,
	`stats_dislike_count` integer,
	`stats_heart_count` integer,
	`stats_comment_count` integer,
	`meta` text
);
--> statement-breakpoint
CREATE INDEX `images_model_id_idx` ON `images` (`model_id`);--> statement-breakpoint
CREATE INDEX `images_version_id_idx` ON `images` (`version_id`);--> statement-breakpoint
CREATE TABLE `latest` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`url` text
);
