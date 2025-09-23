-- Script d'initialisation PostgreSQL pour Archivav2 SAE
-- Ce script configure la base de données et les permissions pour Prisma

-- Créer la base de données principale si elle n'existe pas
SELECT 'CREATE DATABASE "archivav2-sae"'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'archivav2-sae')\gexec

-- Créer l'utilisateur prisma sur la base postgres (avant de se connecter à archivav2-sae)
DO $$
BEGIN
  -- Créer l'utilisateur prisma s'il n'existe pas
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'prisma') THEN
    CREATE ROLE prisma LOGIN PASSWORD 'prisma_password' CREATEDB CREATEROLE;
    RAISE NOTICE 'Utilisateur prisma créé avec succès';
  ELSE
    RAISE NOTICE 'Utilisateur prisma existe déjà';
  END IF;
END
$$;

-- Se connecter à la base de données archivav2-sae
\c "archivav2-sae"

-- Donner toutes les permissions à l'utilisateur prisma sur la base archivav2-sae
DO $$
BEGIN
  -- Donner toutes les permissions sur la base de données actuelle
  GRANT ALL PRIVILEGES ON DATABASE "archivav2-sae" TO prisma;
  GRANT ALL PRIVILEGES ON SCHEMA public TO prisma;
  GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO prisma;
  GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO prisma;
  GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO prisma;
  
  -- Configurer les permissions par défaut pour les futurs objets
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO prisma;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO prisma;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO prisma;
  
  RAISE NOTICE 'Permissions accordées à l''utilisateur prisma sur archivav2-sae';
END
$$;

-- Donner les permissions de création de base de données à postgres
ALTER USER postgres CREATEDB;

-- Activer les extensions utiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Créer les rôles Supabase (pour compatibilité)
DO $$
BEGIN
  -- Créer le rôle anon
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN NOINHERIT;
    GRANT USAGE ON SCHEMA public TO anon;
    GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
    GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon;
    RAISE NOTICE 'Rôle anon créé';
  END IF;
  
  -- Créer le rôle authenticated
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN NOINHERIT;
    GRANT USAGE ON SCHEMA public TO authenticated;
    GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
    GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
    RAISE NOTICE 'Rôle authenticated créé';
  END IF;
  
  -- Créer le rôle service_role
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;
    GRANT ALL ON SCHEMA public TO service_role;
    GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
    GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
    RAISE NOTICE 'Rôle service_role créé';
  END IF;
  
  -- Créer le rôle authenticator
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticator') THEN
    CREATE ROLE authenticator NOINHERIT LOGIN PASSWORD 'postgres';
    GRANT anon TO authenticator;
    GRANT authenticated TO authenticator;
    GRANT service_role TO authenticator;
    RAISE NOTICE 'Rôle authenticator créé';
  END IF;
END
$$;

-- Créer le schéma storage pour Supabase Storage
CREATE SCHEMA IF NOT EXISTS storage;
GRANT USAGE ON SCHEMA storage TO anon, authenticated, service_role, prisma;
GRANT ALL ON ALL TABLES IN SCHEMA storage TO anon, authenticated, service_role, prisma;
GRANT ALL ON ALL SEQUENCES IN SCHEMA storage TO anon, authenticated, service_role, prisma;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA storage TO anon, authenticated, service_role, prisma;

-- Créer le schéma graphql_public pour GraphQL
CREATE SCHEMA IF NOT EXISTS graphql_public;
GRANT USAGE ON SCHEMA graphql_public TO anon, authenticated, service_role, prisma;
GRANT ALL ON ALL TABLES IN SCHEMA graphql_public TO anon, authenticated, service_role, prisma;
GRANT ALL ON ALL SEQUENCES IN SCHEMA graphql_public TO anon, authenticated, service_role, prisma;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA graphql_public TO anon, authenticated, service_role, prisma;

-- Configurer RLS (Row Level Security) par défaut
ALTER DATABASE "archivav2-sae" SET "app.settings.jwt_secret" TO 'super-secret-jwt-token-with-at-least-32-characters-long';

-- Message de confirmation final
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Base de données Archivav2 SAE initialisée';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Base de données: archivav2-sae';
  RAISE NOTICE 'Utilisateurs créés:';
  RAISE NOTICE '  - postgres (admin)';
  RAISE NOTICE '  - prisma (pour Prisma avec CREATEDB)';
  RAISE NOTICE '  - authenticator (pour Supabase)';
  RAISE NOTICE 'Rôles créés: anon, authenticated, service_role';
  RAISE NOTICE 'Extensions activées: uuid-ossp, pgcrypto, pg_stat_statements';
  RAISE NOTICE 'Schémas créés: storage, graphql_public';
  RAISE NOTICE '========================================';
END
$$;
