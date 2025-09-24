# Prisma Migrations

## Problème de Shadow Database

Si vous rencontrez l'erreur "Prisma Migrate could not create the shadow database", voici les solutions :

### Solution 1 : Utiliser `db push` (Recommandée)
```bash
# Au lieu de migrate, utilisez db push
npm run db:push

# Ou avec reset complet
npm run db:push:force
```

### Solution 2 : Configurer la Shadow Database
Ajoutez dans votre `.env` :
```env
SHADOW_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/archivav2-sae-shadow?schema=public"
```

### Solution 3 : Désactiver la Shadow Database
Ajoutez dans `schema.prisma` :
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL")
}
```

### Solution 4 : Donner les permissions à l'utilisateur
Connectez-vous à PostgreSQL et exécutez :
```sql
-- Donner les permissions de création de base de données
ALTER USER postgres CREATEDB;

-- Ou créer un utilisateur avec les bonnes permissions
CREATE USER prisma_user WITH PASSWORD 'prisma_password' CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE "archivav2-sae" TO prisma_user;
```

## Commandes utiles

```bash
# Générer le client Prisma
npm run db:generate

# Appliquer le schéma (sans migration)
npm run db:push

# Réinitialiser complètement
npm run db:push:force

# Voir la base de données
npm run db:studio
```
