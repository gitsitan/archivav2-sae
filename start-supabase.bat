@echo off
echo ========================================
echo   Archivav2 SAE - Démarrage Supabase
echo ========================================

echo.
echo 1. Arrêt des conteneurs existants...
call npm run supabase:down

echo.
echo 2. Suppression des volumes existants (optionnel)...
docker volume rm archivav2-sae_postgres_data 2>nul
docker volume rm archivav2-sae_pgadmin_data 2>nul
docker volume rm archivav2-sae_storage_data 2>nul

echo.
echo 3. Démarrage de Supabase...
call npm run supabase:up

echo.
echo 4. Attente du démarrage des services...
timeout /t 20 /nobreak > nul

echo.
echo 5. Test de connexion à la base de données...
docker exec archivav2-supabase-db psql -U postgres -d archivav2-sae -c "SELECT version();"

echo.
echo 6. Vérification de l'utilisateur prisma...
docker exec archivav2-supabase-db psql -U postgres -d archivav2-sae -c "SELECT rolname, rolsuper, rolcreatedb FROM pg_roles WHERE rolname = 'prisma';"

echo.
echo 7. Réparation de l'utilisateur prisma si nécessaire...
docker exec archivav2-supabase-db psql -U postgres -c "DROP ROLE IF EXISTS prisma; CREATE ROLE prisma LOGIN PASSWORD 'prisma_password' CREATEDB CREATEROLE SUPERUSER;"

echo.
echo 8. Application du schéma Prisma...
call npm run db:push

echo.
echo 9. Génération du client Prisma...
call npm run db:generate

echo.
echo 10. Démarrage de l'application Next.js...
echo.
echo ========================================
echo   Services disponibles :
echo   - Application: http://localhost:3000
echo   - Supabase Studio: http://localhost:3000 (Studio)
echo   - pgAdmin: http://localhost:5050
echo     Email: admin@archivav2.com
echo     Mot de passe: admin
echo   - API PostgREST: http://localhost:3001
echo   - Storage: http://localhost:5000
echo   - Auth: http://localhost:9999
echo   - PostgreSQL: localhost:5432
echo     Base: archivav2-sae
echo     Utilisateur: postgres / prisma
echo     Mot de passe: postgres / prisma_password
echo ========================================
echo.

call npm run dev
