-- NexusChat database initialization
-- This runs once when the container is first created

CREATE DATABASE IF NOT EXISTS chatdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE chatdb;

-- Seed default public rooms (Hibernate will create tables first via ddl-auto=update,
-- so this runs after schema is ready only on subsequent restarts; 
-- use Spring's data.sql or a CommandLineRunner in production instead)

-- The application seeds rooms via Java on startup (see DataInitializer.java)
