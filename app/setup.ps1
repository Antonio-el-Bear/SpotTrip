# PowerShell script to automate full setup and launch

# 1. Backend setup
Write-Host "Setting up Django backend..."
cd backend
if (!(Test-Path venv)) {
    python -m venv venv
}
.\venv\Scripts\activate
pip install -r requirements.txt
if (!(Test-Path .env)) {
    Copy-Item .env.example .env
}
python manage.py migrate
python manage.py collectstatic --noinput
Write-Host "If you have not created a superuser, do so now: python manage.py createsuperuser"
Start-Process powershell -ArgumentList 'python manage.py runserver' -WorkingDirectory $PWD
cd ..

# 2. Frontend setup
Write-Host "Setting up SvelteKit frontend..."
cd tourguide-frontend-fresh
if (!(Test-Path .env)) {
    Copy-Item .env.example .env
}
pnpm install
Start-Process powershell -ArgumentList 'pnpm run dev' -WorkingDirectory $PWD
cd ..

Write-Host "All services are launching. Backend: http://localhost:8000, Frontend: http://localhost:5173"
