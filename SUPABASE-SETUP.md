# 🚀 Configuration Supabase pour Archivav2 SAE

## 📋 Vue d'ensemble

Cette configuration utilise Supabase avec un script d'initialisation PostgreSQL qui :
- ✅ Crée la base de données `archivav2-sae`
- ✅ Configure l'utilisateur `prisma` avec permissions `CREATEDB`
- ✅ Évite les problèmes de shadow database
- ✅ Active les extensions nécessaires
- ✅ Configure les rôles Supabase

## 🔧 Configuration

### 1. Fichiers de configuration

- **`docker-compose-supabase.yml`** : Configuration Supabase complète
- **`supabase/init/01-init-database.sql`** : Script d'initialisation PostgreSQL
- **`env.local.example`** : Variables d'environnement

### 2. Services inclus

- 🗄️ **PostgreSQL** (port 5432) - Base de données avec extensions
- 🔌 **API PostgREST** (port 3001) - API REST automatique
- 🔐 **Auth GoTrue** (port 9999) - Authentification
- 📁 **Storage** (port 5000) - Stockage de fichiers
- 🎨 **Studio** (port 3000) - Interface d'administration
- 🎛️ **pgAdmin** (port 5050) - Administration PostgreSQL
- 📊 **Meta API** (port 8081) - API de métadonnées

## 🚀 Démarrage rapide

### Option 1 : Script automatique (Recommandé)

**Windows Batch :**
```bash
start-supabase.bat
```

**Windows PowerShell :**
```powershell
.\start-supabase.ps1
```

### Option 2 : Démarrage manuel

```bash
# 1. Copier la configuration d'environnement
copy env.local.example .env.local

# 2. Démarrer Supabase
npm run supabase:up

# 3. Attendre 20 secondes que les services démarrent

# 4. Appliquer le schéma Prisma
npm run db:push

# 5. Générer le client Prisma
npm run db:generate

# 6. Démarrer l'application
npm run dev
```

## 🔑 Utilisateurs de base de données

### Utilisateur `postgres` (Admin)
- **Mot de passe** : `postgres`
- **Permissions** : Toutes + CREATEDB
- **Usage** : Administration, migrations

### Utilisateur `prisma` (Développement)
- **Mot de passe** : `prisma_password`
- **Permissions** : Toutes + CREATEDB
- **Usage** : Prisma, shadow database

### Utilisateur `authenticator` (Supabase)
- **Mot de passe** : `postgres`
- **Permissions** : Rôles anon, authenticated, service_role
- **Usage** : API Supabase

## 🌐 Accès aux services

| Service | URL | Credentials |
|---------|-----|-------------|
| **Application** | http://localhost:3000 | - |
| **Supabase Studio** | http://localhost:3000 | - |
| **pgAdmin** | http://localhost:5050 | admin@archivav2.com / admin |
| **API PostgREST** | http://localhost:3001 | - |
| **Storage** | http://localhost:5000 | - |
| **Auth** | http://localhost:9999 | - |
| **PostgreSQL** | localhost:5432 | postgres / postgres |

## 🔧 Configuration Prisma

### Variables d'environnement (.env.local)

```env
# URL principale (utilisateur postgres)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/archivav2-sae?schema=public"

# URL shadow database (utilisateur prisma)
SHADOW_DATABASE_URL="postgresql://prisma:prisma_password@localhost:5432/archivav2-sae?schema=public"
```

### Commandes Prisma

```bash
# Appliquer le schéma (recommandé pour le développement)
npm run db:push

# Générer le client Prisma
npm run db:generate

# Voir la base de données
npm run db:studio

# Migrations (si nécessaire)
npm run db:migrate --name nom-migration
```

## 🛠️ Dépannage

### Problème de shadow database
```bash
# Vérifier que l'utilisateur prisma existe
docker exec archivav2-supabase-db psql -U postgres -d archivav2-sae -c "SELECT rolname, rolcreatedb FROM pg_roles WHERE rolname = 'prisma';"

# Recréer l'utilisateur si nécessaire
docker exec archivav2-supabase-db psql -U postgres -d archivav2-sae -c "CREATE ROLE prisma LOGIN PASSWORD 'prisma_password' CREATEDB;"
```

### Problème de collation
```bash
# Redémarrer avec volumes propres
npm run supabase:down
docker volume rm archivav2-sae_postgres_data
npm run supabase:up
```

### Services qui ne démarrent pas
```bash
# Voir les logs
npm run supabase:logs

# Redémarrer un service spécifique
docker-compose -f docker-compose-supabase.yml restart db
```

## 📚 Extensions PostgreSQL activées

- `uuid-ossp` - Génération d'UUID
- `pgcrypto` - Fonctions cryptographiques
- `pg_stat_statements` - Statistiques de performance

## 🔒 Sécurité

⚠️ **Important** : Cette configuration est pour le développement uniquement.

Pour la production :
1. Changez tous les mots de passe
2. Utilisez des certificats SSL
3. Configurez un firewall
4. Utilisez des variables d'environnement sécurisées

## 📖 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Documentation Prisma](https://www.prisma.io/docs)
- [Documentation PostgreSQL](https://www.postgresql.org/docs/)
