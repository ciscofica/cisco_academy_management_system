-- Migración aditiva e idempotente. Respaldar la base antes de ejecutar.
-- Se detecta cada columna porque versiones previas del sistema ya tienen
-- parte de los campos académicos del catálogo.
ALTER TABLE `detail` MODIFY COLUMN `course_description` TEXT NOT NULL;

SET @ddl = IF(
  EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'course' AND COLUMN_NAME = 'class_code'),
  'SELECT 1', 'ALTER TABLE `course` ADD COLUMN `class_code` VARCHAR(255) NULL'
);
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @ddl = IF(
  EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'detail' AND COLUMN_NAME = 'prerequisites'),
  'SELECT 1', 'ALTER TABLE `detail` ADD COLUMN `prerequisites` TEXT NULL'
);
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @ddl = IF(
  EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'course_chapter' AND COLUMN_NAME = 'sort_order'),
  'SELECT 1', 'ALTER TABLE `course_chapter` ADD COLUMN `sort_order` INT NULL'
);
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

UPDATE `course_chapter` SET `sort_order` = `course_chapter_id` WHERE `sort_order` IS NULL;

ALTER TABLE `chapter` MODIFY COLUMN `modality` VARCHAR(100) NULL DEFAULT NULL;

SET @ddl = IF(
  EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'chapter' AND COLUMN_NAME = 'session_start_time'),
  'SELECT 1', 'ALTER TABLE `chapter` ADD COLUMN `session_start_time` TIME NULL'
);
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @ddl = IF(
  EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'chapter' AND COLUMN_NAME = 'session_end_time'),
  'SELECT 1', 'ALTER TABLE `chapter` ADD COLUMN `session_end_time` TIME NULL'
);
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

INSERT INTO `participant_type` (`name`, `status`)
SELECT wanted.`name`, 'Activo'
FROM (
  SELECT 'Estudiante Pregrado UTN' AS `name`
  UNION ALL SELECT 'Estudiante Posgrado UTN'
  UNION ALL SELECT 'Egresado UTN'
  UNION ALL SELECT 'Graduado UTN'
  UNION ALL SELECT 'Docente UTN'
  UNION ALL SELECT 'Administrativo UTN'
  UNION ALL SELECT 'Particular'
) AS wanted
WHERE NOT EXISTS (
  SELECT 1 FROM `participant_type` existing WHERE LOWER(existing.`name`) = LOWER(wanted.`name`)
);
