# Archivav2 SAE - Démarrage Supabase
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Archivav2 SAE - Démarrage Supabase" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "1. Arrêt des conteneurs existants..." -ForegroundColor Yellow
npm run supabase:down

Write-Host ""
Write-Host "2. Suppression des volumes existants (optionnel)..." -ForegroundColor Yellow
docker volume rm archivav2-sae_postgres_data 2>$null
docker volume rm archivav2-sae_pgadmin_data 2>$null
docker volume rm archivav2-sae_storage_data 2>$null

Write-Host ""
Write-Host "3. Démarrage de Supabase..." -ForegroundColor Yellow
npm run supabase:up

Write-Host ""
Write-Host "4. Attente du démarrage des services..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

Write-Host ""
Write-Host "5. Test de connexion à la base de données..." -ForegroundColor Yellow
docker exec archivav2-supabase-db psql -U postgres -d archivav2-sae -c "SELECT version();"

Write-Host ""
Write-Host "6. Vérification de l'utilisateur prisma..." -ForegroundColor Yellow
docker exec archivav2-supabase-db psql -U postgres -d archivav2-sae -c "SELECT rolname, rolcreatedb FROM pg_roles WHERE rolname = 'prisma';"

Write-Host ""
Write-Host "7. Application du schéma Prisma..." -ForegroundColor Yellow
npm run db:push

Write-Host ""
Write-Host "8. Génération du client Prisma..." -ForegroundColor Yellow
npm run db:generate

Write-Host ""
Write-Host "9. Démarrage de l'application Next.js..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   Services disponibles :" -ForegroundColor Green
Write-Host "   - Application: http://localhost:3000" -ForegroundColor Green
Write-Host "   - Supabase Studio: http://localhost:3000 (Studio)" -ForegroundColor Green
Write-Host "   - pgAdmin: http://localhost:5050" -ForegroundColor Green
Write-Host "     Email: admin@archivav2.com" -ForegroundColor Green
Write-Host "     Mot de passe: admin" -ForegroundColor Green
Write-Host "   - API PostgREST: http://localhost:3001" -ForegroundColor Green
Write-Host "   - Storage: http://localhost:5000" -ForegroundColor Green
Write-Host "   - Auth: http://localhost:9999" -ForegroundColor Green
Write-Host "   - PostgreSQL: localhost:5432" -ForegroundColor Green
Write-Host "     Base: archivav2-sae" -ForegroundColor Green
Write-Host "     Utilisateur: postgres / prisma" -ForegroundColor Green
Write-Host "     Mot de passe: postgres / prisma_password" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

npm run dev
