@echo off
echo ========================================
echo   Test de la base de données
echo ========================================

echo.
echo 1. Test de connexion avec postgres...
docker exec archivav2-supabase-db psql -U postgres -d archivav2-sae -c "SELECT current_user, current_database();"

echo.
echo 2. Test de connexion avec prisma...
docker exec archivav2-supabase-db psql -U prisma -d archivav2-sae -c "SELECT current_user, current_database();"

echo.
echo 3. Vérification des permissions de prisma...
docker exec archivav2-supabase-db psql -U postgres -d archivav2-sae -c "SELECT rolname, rolcreatedb, rolcreaterole FROM pg_roles WHERE rolname = 'prisma';"

echo.
echo 4. Test de création de table avec prisma...
docker exec archivav2-supabase-db psql -U prisma -d archivav2-sae -c "CREATE TABLE IF NOT EXISTS test_table (id SERIAL PRIMARY KEY, name TEXT); DROP TABLE IF EXISTS test_table;"

echo.
echo 5. Test de Prisma db push...
call npm run db:push

echo.
echo ========================================
echo   Tests terminés
echo ========================================
