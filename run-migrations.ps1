#!/usr/bin/env pwsh

# Run Supabase migrations to add new challenges
Write-Host "Running database migrations to add new challenges..." -ForegroundColor Green

try {
    # Check if supabase CLI is available
    supabase --version

    # Apply the new migrations
    Write-Host "Applying migration: 20241204000001_more_challenges.sql" -ForegroundColor Yellow
    supabase db push

    Write-Host "Migrations completed successfully!" -ForegroundColor Green
} catch {
    Write-Error "Failed to run migrations: $_"
    Write-Host "Make sure you have Supabase CLI installed and are in the correct directory" -ForegroundColor Red
}