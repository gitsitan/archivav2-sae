@echo off
echo ========================================
echo   Réparation de l'utilisateur Prisma
echo ========================================

echo.
echo 1. Suppression de l'utilisateur prisma existant...
docker exec archivav2-supabase-db psql -U postgres -c "DROP ROLE IF EXISTS prisma;"

echo.
echo 2. Création de l'utilisateur prisma...
docker exec archivav2-supabase-db psql -U postgres -c "CREATE ROLE prisma LOGIN PASSWORD 'prisma_password' CREATEDB CREATEROLE;"

echo.
echo 3. Attribution des permissions sur archivav2-sae...
docker exec archivav2-supabase-db psql -U postgres -d archivav2-sae -c "GRANT ALL PRIVILEGES ON DATABASE \"archivav2-sae\" TO prisma;"
docker exec archivav2-supabase-db psql -U postgres -d archivav2-sae -c "GRANT ALL PRIVILEGES ON SCHEMA public TO prisma;"
docker exec archivav2-supabase-db psql -U postgres -d archivav2-sae -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO prisma;"
docker exec archivav2-supabase-db psql -U postgres -d archivav2-sae -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO prisma;"
docker exec archivav2-supabase-db psql -U postgres -d archivav2-sae -c "GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO prisma;"

echo.
echo 4. Configuration des permissions par défaut...
docker exec archivav2-supabase-db psql -U postgres -d archivav2-sae -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO prisma;"
docker exec archivav2-supabase-db psql -U postgres -d archivav2-sae -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO prisma;"
docker exec archivav2-supabase-db psql -U postgres -d archivav2-sae -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO prisma;"

echo.
echo 5. Test de connexion avec prisma...
docker exec archivav2-supabase-db psql -U prisma -d archivav2-sae -c "SELECT current_user, current_database();"

echo.
echo 6. Test de Prisma db push...
call npm run db:push

echo.
echo ========================================
echo   Réparation terminée
echo ========================================
