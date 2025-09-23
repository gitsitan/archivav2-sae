# 🐳 Configuration Docker pour Archivav2 SAE

Ce projet propose plusieurs configurations Docker pour différents besoins de développement.

## 📁 Fichiers de configuration

### 1. `docker-compose.yml` - Configuration Supabase complète
Configuration complète avec tous les services Supabase (PostgreSQL, API, Auth, Storage, Studio).

**Services inclus :**
- 🗄️ **PostgreSQL** (port 5432) - Base de données avec extensions Supabase
- 🔌 **API PostgREST** (port 3001) - API REST automatique
- 🔐 **Auth GoTrue** (port 9999) - Authentification
- 📁 **Storage** (port 5000) - Stockage de fichiers
- 🎨 **Studio** (port 3000) - Interface d'administration
- 📊 **Meta API** (port 8081) - API de métadonnées

**Commandes :**
```bash
# Démarrer tous les services
npm run supabase:up

# Arrêter tous les services
npm run supabase:down

# Voir les logs
npm run supabase:logs

# Démarrer seulement le Studio
npm run supabase:studio
```

### 2. `docker-compose-simple.yml` - Configuration PostgreSQL simple
Configuration simplifiée avec PostgreSQL et pgAdmin.

**Services inclus :**
- 🗄️ **PostgreSQL** (port 5432) - Base de données avec extensions Supabase
- 🎛️ **pgAdmin** (port 5050) - Interface d'administration

**Commandes :**
```bash
# Démarrer les services
npm run supabase:simple

# Arrêter les services
npm run supabase:simple:down
```

### 3. `docker-compose copy.yml` - Configuration PostgreSQL basique
Configuration PostgreSQL standard (sans Supabase).

## 🚀 Démarrage rapide

### Option 1 : Supabase complet (recommandé)
```bash
# Démarrer Supabase
npm run supabase:up

# Attendre que tous les services soient prêts
# Puis appliquer les migrations Prisma
npx prisma migrate dev --name initial-schema

# Générer le client Prisma
npx prisma generate

# Démarrer l'application
npm run dev
```

### Option 2 : PostgreSQL simple
```bash
# Démarrer PostgreSQL + pgAdmin
npm run supabase:simple

# Appliquer les migrations Prisma
npx prisma migrate dev --name initial-schema

# Générer le client Prisma
npx prisma generate

# Démarrer l'application
npm run dev
```

## 🌐 Accès aux services

### Configuration Supabase complète
- **Studio Supabase** : http://localhost:3000
- **API PostgREST** : http://localhost:3001
- **Storage** : http://localhost:5000
- **Auth** : http://localhost:9999
- **PostgreSQL** : localhost:5432

### Configuration simple
- **pgAdmin** : http://localhost:5050
  - Email : admin@archivav2.com
  - Mot de passe : admin
- **PostgreSQL** : localhost:5432

## 🔧 Configuration de la base de données

### Variables d'environnement
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres?schema=public"
```

### Connexion à la base de données
- **Host** : localhost
- **Port** : 5432
- **Database** : postgres
- **Username** : postgres
- **Password** : postgres

## 📋 Extensions PostgreSQL activées

La configuration Supabase active automatiquement :
- `uuid-ossp` - Génération d'UUID
- `pgcrypto` - Fonctions cryptographiques
- `pgjwt` - JWT tokens
- `pgsodium` - Chiffrement
- `pg_graphql` - API GraphQL
- `pg_stat_statements` - Statistiques
- `pg_net` - Requêtes HTTP
- `pg_jsonschema` - Validation JSON

## 🛠️ Dépannage

### Problème de port déjà utilisé
```bash
# Vérifier les ports utilisés
netstat -an | findstr :5432
netstat -an | findstr :3000

# Arrêter les services
npm run supabase:down
```

### Réinitialiser la base de données
```bash
# Arrêter les services
npm run supabase:down

# Supprimer les volumes
docker volume rm archivav2-sae_postgres_data

# Redémarrer
npm run supabase:up
```

### Logs détaillés
```bash
# Voir tous les logs
npm run supabase:logs

# Logs d'un service spécifique
docker-compose -f docker-compose-supabase.yml logs db
docker-compose -f docker-compose-supabase.yml logs api
```

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Documentation PostgREST](https://postgrest.org/)
- [Documentation Prisma](https://www.prisma.io/docs)
- [Documentation Docker Compose](https://docs.docker.com/compose/)

## ⚠️ Notes importantes

1. **Sécurité** : Cette configuration est pour le développement uniquement
2. **Mots de passe** : Changez les mots de passe par défaut en production
3. **Volumes** : Les données sont persistantes grâce aux volumes Docker
4. **Réseau** : Tous les services communiquent via le réseau `archivav2-network`
