# Réparation de l'utilisateur Prisma (SUPERUSER)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Réparation de l'utilisateur Prisma (SUPERUSER)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "1. Suppression de l'utilisateur prisma existant..." -ForegroundColor Yellow
docker exec archivav2-supabase-db psql -U postgres -c "DROP ROLE IF EXISTS prisma;"

Write-Host ""
Write-Host "2. Création de l'utilisateur prisma avec SUPERUSER..." -ForegroundColor Yellow
docker exec archivav2-supabase-db psql -U postgres -c "CREATE ROLE prisma LOGIN PASSWORD 'prisma_password' CREATEDB CREATEROLE SUPERUSER;"

Write-Host ""
Write-Host "3. Vérification des permissions..." -ForegroundColor Yellow
docker exec archivav2-supabase-db psql -U postgres -c "SELECT rolname, rolsuper, rolcreatedb, rolcreaterole FROM pg_roles WHERE rolname = 'prisma';"

Write-Host ""
Write-Host "4. Test de connexion avec prisma..." -ForegroundColor Yellow
docker exec archivav2-supabase-db psql -U prisma -d archivav2-sae -c "SELECT current_user, current_database(), session_user;"

Write-Host ""
Write-Host "5. Test de Prisma db push..." -ForegroundColor Yellow
npm run db:push

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   Réparation terminée - Prisma est maintenant SUPERUSER" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

