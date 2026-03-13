# SpotTrip

This repository contains the TourGuide 2.0 tourism app, including backend and frontend code. 

## Project Structure

- `app/backend/`: Django backend with models, views, and API endpoints.
- `app/tourguide-frontend-fresh/`: Svelte frontend for user interface and client logic.

## Setup

### Backend
1. Navigate to `app/backend/`.
2. Install dependencies:
   ```
pip install -r requirements.txt
```
3. Run migrations:
   ```
python manage.py migrate
```
4. Start server:
   ```
python manage.py runserver
```

### Frontend
1. Navigate to `app/tourguide-frontend-fresh/`.
2. Install dependencies:
   ```
pnpm install
```
3. Start development server:
   ```
pnpm run dev
```

## Features
- User authentication
- Tour booking
- Dashboard and profile management
- Travel deals integration

## License
MIT

---
For more details, see individual README files in backend and frontend folders.