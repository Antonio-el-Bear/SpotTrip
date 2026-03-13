
# TourGuide Full Stack App

## Prerequisites
- Python 3.10+
- Node.js 18+
- pnpm (recommended for frontend)
- Docker (recommended) OR PostgreSQL server must be running locally

## Project Structure
```
tourguide2.0/
└── app/
    ├── backend/                  ← Django REST API
    │   ├── server/               ← Django app code
    │   │   ├── users/            ← Django users app
    │   │   │   ├── models.py
    │   │   │   ├── serializers.py
    │   │   │   ├── urls.py
    │   │   │   └── views.py
    │   │   ├── apps.py
    │   │   ├── settings.py
    │   │   └── urls.py
    │   ├── .env
    │   ├── .env.example
    │   ├── requirements.txt
    │   └── README.md
    ├── tourguide-frontend-fresh/ ← SvelteKit frontend
    │   ├── src/
    │   ├── package.json
    │   └── README.md
    ├── .venv/                    ← Shared Python virtual environment
    ├── README.md
    └── setup.ps1
```

## 1. Database Setup

Start PostgreSQL via Docker (recommended):

```sh
docker run --name tourguide-db \
    -e POSTGRES_USER=root \
    -e POSTGRES_PASSWORD=mysecretpassword \
    -e POSTGRES_DB=local \
    -p 5432:5432 -d postgres
```

Copy app/backend/.env.example to app/backend/.env and update credentials:

```
DATABASE_URL=postgres://root:mysecretpassword@localhost:5432/local
```

## 2. Backend (Django)
Open a terminal and run:

```sh
cd app
.venv\Scripts\activate       # Windows — activate shared Python env
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser   # Follow prompts
python manage.py runserver
```
The backend API will be available at http://localhost:8000/

## 3. Frontend (SvelteKit)
Open a new terminal and run:

```sh
cd app/tourguide-frontend-fresh
pnpm install
pnpm approve-builds
pnpm run dev
```
The frontend will be available at http://localhost:5173/ (or next available port)

## 4. One-Click Launch (VS Code)
Open the Command Palette (Ctrl+Shift+P), type Run Task, and select:

- Start Both (Parallel) — launches backend and frontend together

## 5. Usage
| Route                        | Description           |
|------------------------------|----------------------|
| /auth/register               | Register a new user  |
| /auth/login                  | Login                |
| /auth/profile                | View your profile    |
| /auth/roles                  | View all user roles  |

## Troubleshooting
- 500 errors on frontend — ensure PostgreSQL is running and DATABASE_URL is correct in app/backend/.env
- CORS errors — make sure both servers are running (http://localhost:8000 for backend, http://localhost:5173 for frontend)
- Model changes — run `cd app/backend && python manage.py makemigrations && python manage.py migrate`
- Port conflicts — Vite will auto-select the next available port (5174, 5175, etc.)
- esbuild warning — run `cd app/tourguide-frontend-fresh && pnpm approve-builds` to allow build scripts
