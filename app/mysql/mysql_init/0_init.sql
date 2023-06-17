-- CREATE DATABASE IF NOT EXISTS app;

-- CREATE TABLE `user` (
--     `user_id` VARCHAR(36) NOT NULL,
--     `employee_id` VARCHAR(50) NOT NULL,
--     `user_name` VARCHAR(50) NOT NULL,
--     `kana` VARCHAR(50) NOT NULL,
--     `mail` VARCHAR(200) NOT NULL,
--     `password` VARCHAR(100) NOT NULL,
--     `entry_date` DATE NOT NULL,
--     `office_id` VARCHAR(36) NOT NULL,
--     `user_icon_id` VARCHAR(36) NOT NULL,
--     `goal` VARCHAR(1024) NOT NULL,
--     PRIMARY KEY (`user_id`)
-- );
-- ALTER TABLE user ADD INDEX idx_user_id (user_id), ADD INDEX idx_password (password);

-- CREATE TABLE `session` (
--     `session_id` VARCHAR(36) NOT NULL,
--     `linked_user_id` VARCHAR(36) NOT NULL,
--     `created_at` DATE NOT NULL,
--     PRIMARY KEY (`session_id`)
-- );
-- ALTER TABLE session ADD INDEX idx_linked_user_id (linked_user_id ), ADD INDEX idx_session_id (session_id);

-- CREATE TABLE `department` (
--     `department_id` VARCHAR(36) NOT NULL,
--     `department_name` VARCHAR(50) NOT NULL,
--     `active` TINYINT(1) NOT NULL DEFAULT '1',
--     PRIMARY KEY (`department_id`)
-- );

-- CREATE TABLE `role` (
--     `role_id` VARCHAR(36) NOT NULL,
--     `role_name` VARCHAR(50) NOT NULL,
--     `active` TINYINT(1) NOT NULL DEFAULT '1',
--     PRIMARY KEY (`role_id`)
-- );

-- CREATE TABLE `department_role_member` (
--     `department_id` VARCHAR(36) NOT NULL,
--     `role_id` VARCHAR(36) NOT NULL,
--     `user_id` VARCHAR(36) NOT NULL,
--     `entry_date` DATE NOT NULL,
--     `belong` TINYINT(1) NOT NULL DEFAULT '1',
--     PRIMARY KEY (`department_id`, `role_id`, `user_id`, `entry_date`)
-- );

-- CREATE TABLE `office` (
--     `office_id` VARCHAR(36) NOT NULL,
--     `office_name` VARCHAR(50) NOT NULL,
--     PRIMARY KEY (`office_id`)
-- );

-- CREATE TABLE `file` (
--     `file_id` VARCHAR(36) NOT NULL,
--     `file_name` VARCHAR(120) NOT NULL,
--     `path` VARCHAR(1024) NOT NULL,
--     PRIMARY KEY (`file_id`)
-- );
-- ALTER TABLE file ADD INDEX idx_file_name (file_name), ADD INDEX idx_file_id (file_id);


-- CREATE TABLE `skill` (
--     `skill_id` VARCHAR(36) NOT NULL,
--     `skill_name` VARCHAR(50) NOT NULL,
--     PRIMARY KEY (`skill_id`)
-- );
-- ALTER TABLE skill ADD INDEX idx_skill_name (skill_name);

-- CREATE TABLE `skill_member` (
--     `skill_id` VARCHAR(36) NOT NULL,
--     `user_id` VARCHAR(36) NOT NULL,
--     PRIMARY KEY (`skill_id`, `user_id`)
-- );

-- CREATE TABLE `match_group` (
--     `match_group_id` VARCHAR(36) NOT NULL,
--     `match_group_name` VARCHAR(50) NOT NULL,
--     `description` VARCHAR(120) NOT NULL,
--     `status` VARCHAR(10) NOT NULL DEFAULT 'open',
--     `created_by` VARCHAR(36) NOT NULL,
--     `created_at` DATE NOT NULL,
--     PRIMARY KEY (`match_group_id`)
-- );
-- ALTER TABLE match_group ADD INDEX idx_match_group_id (match_group_id );

-- CREATE TABLE `match_group_member` (
--     `match_group_id` VARCHAR(36) NOT NULL,
--     `user_id` VARCHAR(36) NOT NULL,
--     PRIMARY KEY (`match_group_id`, `user_id`)
-- );
-- ALTER TABLE match_group_member ADD INDEX idx_user_id (user_id);


-- -- `user`テーブル
-- ALTER TABLE `user` ADD INDEX idx_employee_id (employee_id);
-- ALTER TABLE `user` ADD INDEX idx_mail (mail);
-- ALTER TABLE `user` ADD INDEX idx_office_id (office_id);

-- -- `session`テーブル
-- ALTER TABLE `session` ADD INDEX idx_created_at (created_at);

-- -- `department`テーブル
-- ALTER TABLE `department` ADD INDEX idx_department_name (department_name);

-- -- `role`テーブル
-- ALTER TABLE `role` ADD INDEX idx_role_name (role_name);

-- -- `department_role_member`テーブル
-- ALTER TABLE `department_role_member` ADD INDEX idx_user_id (user_id);

-- -- `office`テーブル
-- ALTER TABLE `office` ADD INDEX idx_office_name (office_name);

-- -- `file`テーブル
-- ALTER TABLE `file` ADD INDEX idx_path (path);

-- -- `match_group`テーブル
-- ALTER TABLE `match_group` ADD INDEX idx_created_by (created_by);


CREATE DATABASE IF NOT EXISTS app;

CREATE TABLE IF NOT EXISTS `user` (
  `user_id` VARCHAR(36) NOT NULL,
  `employee_id` VARCHAR(50) NOT NULL,
  `user_name` VARCHAR(50) NOT NULL,
  `kana` VARCHAR(50) NOT NULL,
  `mail` VARCHAR(200) NOT NULL,
  `password` VARCHAR(100) NOT NULL,
  `entry_date` DATE NOT NULL,
  `office_id` VARCHAR(36) NOT NULL,
  `user_icon_id` VARCHAR(36) NOT NULL,
  `goal` VARCHAR(1024) NOT NULL,
  PRIMARY KEY (`user_id`),
  INDEX `idx_employee_id` (`employee_id`),
  INDEX `idx_mail` (`mail`),
  INDEX `idx_office_id` (`office_id`)
);

CREATE TABLE IF NOT EXISTS `session` (
  `session_id` VARCHAR(36) NOT NULL,
  `linked_user_id` VARCHAR(36) NOT NULL,
  `created_at` DATE NOT NULL,
  PRIMARY KEY (`session_id`),
  INDEX `idx_linked_user_id` (`linked_user_id`),
  INDEX `idx_created_at` (`created_at`)
);

CREATE TABLE IF NOT EXISTS `department` (
  `department_id` VARCHAR(36) NOT NULL,
  `department_name` VARCHAR(50) NOT NULL,
  `active` TINYINT(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`department_id`),
  INDEX `idx_department_name` (`department_name`)
);

CREATE TABLE IF NOT EXISTS `role` (
  `role_id` VARCHAR(36) NOT NULL,
  `role_name` VARCHAR(50) NOT NULL,
  `active` TINYINT(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`role_id`),
  INDEX `idx_role_name` (`role_name`)
);

CREATE TABLE IF NOT EXISTS `department_role_member` (
  `department_id` VARCHAR(36) NOT NULL,
  `role_id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `entry_date` DATE NOT NULL,
  `belong` TINYINT(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`department_id`, `role_id`, `user_id`, `entry_date`),
  INDEX `idx_user_id` (`user_id`)
);

CREATE TABLE IF NOT EXISTS `office` (
  `office_id` VARCHAR(36) NOT NULL,
  `office_name` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`office_id`),
  INDEX `idx_office_name` (`office_name`)
);

CREATE TABLE IF NOT EXISTS `file` (
  `file_id` VARCHAR(36) NOT NULL,
  `file_name` VARCHAR(120) NOT NULL,
  `path` VARCHAR(1024) NOT NULL,
  PRIMARY KEY (`file_id`),
  INDEX `idx_file_name` (`file_name`),
  INDEX `idx_path` (`path`)
);

CREATE TABLE IF NOT EXISTS `skill` (
  `skill_id` VARCHAR(36) NOT NULL,
  `skill_name` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`skill_id`),
  INDEX `idx_skill_name` (`skill_name`)
);

CREATE TABLE IF NOT EXISTS `skill_member` (
  `skill_id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  PRIMARY KEY (`skill_id`, `user_id`)
);

CREATE TABLE IF NOT EXISTS `match_group` (
  `match_group_id` VARCHAR(36) NOT NULL,
  `match_group_name` VARCHAR(50) NOT NULL,
  `description` VARCHAR(120) NOT NULL,
  `status` VARCHAR(10) NOT NULL DEFAULT 'open',
  `created_by` VARCHAR(36) NOT NULL,
  `created_at` DATE NOT NULL,
  PRIMARY KEY (`match_group_id`),
  INDEX `idx_match_group_id` (`match_group_id`),
  INDEX `idx_created_by` (`created_by`)
);

CREATE TABLE IF NOT EXISTS `match_group_member` (
  `match_group_id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  PRIMARY KEY (`match_group_id`, `user_id`),
  INDEX `idx_user_id` (`user_id`)
);

