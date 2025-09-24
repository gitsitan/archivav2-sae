@echo off
echo ========================================
echo   Réparation de l'utilisateur Prisma (SUPERUSER)
echo ========================================

echo.
echo 1. Suppression de l'utilisateur prisma existant...
docker exec archivav2-supabase-db psql -U postgres -c "DROP ROLE IF EXISTS prisma;"

echo.
echo 2. Création de l'utilisateur prisma avec SUPERUSER...
docker exec archivav2-supabase-db psql -U postgres -c "CREATE ROLE prisma LOGIN PASSWORD 'prisma_password' CREATEDB CREATEROLE SUPERUSER;"

echo.
echo 3. Vérification des permissions...
docker exec archivav2-supabase-db psql -U postgres -c "SELECT rolname, rolsuper, rolcreatedb, rolcreaterole FROM pg_roles WHERE rolname = 'prisma';"

echo.
echo 4. Test de connexion avec prisma...
docker exec archivav2-supabase-db psql -U prisma -d archivav2-sae -c "SELECT current_user, current_database(), session_user;"

echo.
echo 5. Test de Prisma db push...
call npm run db:push

echo.
echo ========================================
echo   Réparation terminée - Prisma est maintenant SUPERUSER
echo ========================================

