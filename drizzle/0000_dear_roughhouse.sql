CREATE TABLE `companies` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`aliases` text NOT NULL,
	`ticker` text,
	`exchange` text,
	`cik` text,
	`hq_country` text,
	`is_sponsor` integer NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `deals` (
	`id` text PRIMARY KEY NOT NULL,
	`origin` text NOT NULL,
	`dedupe_key` text NOT NULL,
	`headline` text NOT NULL,
	`sector` text NOT NULL,
	`subsectors` text NOT NULL,
	`geography_region` text NOT NULL,
	`buyer_ids` text NOT NULL,
	`target_ids` text NOT NULL,
	`seller_ids` text NOT NULL,
	`announcement_date` text NOT NULL,
	`closing_date` text NOT NULL,
	`transaction_status` text NOT NULL,
	`transaction_status_source_ids` text NOT NULL,
	`user_status` text NOT NULL,
	`status_before_delete` text,
	`deal_value` text NOT NULL,
	`quick_preview` text NOT NULL,
	`ranking` text NOT NULL,
	`first_seen_run_id` text NOT NULL,
	`search_run_ids` text NOT NULL,
	`deleted_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`deal_id` text,
	`status` text NOT NULL,
	`stage` text,
	`progress` integer DEFAULT 0 NOT NULL,
	`started_at` text,
	`heartbeat_at` text,
	`finished_at` text,
	`error` text,
	`usage` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `notes` (
	`id` text PRIMARY KEY NOT NULL,
	`deal_id` text,
	`template_section` text,
	`quote` text,
	`block_id` text,
	`covered_block_ids` text NOT NULL,
	`source_ids` text NOT NULL,
	`report_version_id` text,
	`comment` text NOT NULL,
	`pinned` integer DEFAULT false NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `research_reports` (
	`id` text PRIMARY KEY NOT NULL,
	`deal_id` text NOT NULL,
	`version` integer NOT NULL,
	`job_id` text NOT NULL,
	`created_at` text NOT NULL,
	`provider` text NOT NULL,
	`model` text NOT NULL,
	`prompt_version` text NOT NULL,
	`sections` text NOT NULL,
	`open_questions` text NOT NULL,
	`source_ids` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `search_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`filters` text NOT NULL,
	`provider` text NOT NULL,
	`origin` text NOT NULL,
	`job_id` text NOT NULL,
	`result_deal_ids` text NOT NULL,
	`excluded` text NOT NULL,
	`started_at` text NOT NULL,
	`finished_at` text
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` text PRIMARY KEY NOT NULL,
	`display_name` text DEFAULT 'Nikita' NOT NULL,
	`research_mode` text DEFAULT 'demo' NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sources` (
	`id` text PRIMARY KEY NOT NULL,
	`job_id` text NOT NULL,
	`origin` text NOT NULL,
	`url` text NOT NULL,
	`publisher` text NOT NULL,
	`title` text NOT NULL,
	`published_at` text,
	`accessed_at` text NOT NULL,
	`source_type` text NOT NULL,
	`retrieved_via` text NOT NULL,
	`reliability_note` text,
	`excerpt` text
);
