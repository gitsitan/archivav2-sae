-- Initialisation Supabase pour Archivav2 SAE
-- Ce script configure les extensions et rôles nécessaires

-- Activer les extensions Supabase
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pgjwt";
CREATE EXTENSION IF NOT EXISTS "pgsodium";
CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_net";
CREATE EXTENSION IF NOT EXISTS "pg_jsonschema";

-- Créer les rôles Supabase
DO $$
BEGIN
  -- Créer le rôle anon
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN NOINHERIT;
  END IF;
  
  -- Créer le rôle authenticated
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN NOINHERIT;
  END IF;
  
  -- Créer le rôle service_role
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;
  END IF;
  
  -- Créer le rôle authenticator
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticator') THEN
    CREATE ROLE authenticator NOINHERIT LOGIN PASSWORD 'postgres';
  END IF;
END
$$;

-- Donner les permissions aux rôles
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- Configurer les permissions par défaut
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;

-- Créer le schéma storage pour Supabase Storage
CREATE SCHEMA IF NOT EXISTS storage;

-- Donner les permissions sur le schéma storage
GRANT USAGE ON SCHEMA storage TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA storage TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA storage TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA storage TO anon, authenticated, service_role;

-- Créer le schéma graphql_public pour GraphQL
CREATE SCHEMA IF NOT EXISTS graphql_public;

-- Donner les permissions sur le schéma graphql_public
GRANT USAGE ON SCHEMA graphql_public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA graphql_public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA graphql_public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA graphql_public TO anon, authenticated, service_role;

-- Configurer RLS (Row Level Security) par défaut
ALTER DATABASE postgres SET "app.settings.jwt_secret" TO 'super-secret-jwt-token-with-at-least-32-characters-long';

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Supabase initialisé avec succès pour Archivav2 SAE';
  RAISE NOTICE 'Extensions activées: uuid-ossp, pgcrypto, pgjwt, pgsodium, pg_graphql, pg_stat_statements, pg_net, pg_jsonschema';
  RAISE NOTICE 'Rôles créés: anon, authenticated, service_role, authenticator';
  RAISE NOTICE 'Schémas créés: storage, graphql_public';
END
$$;
