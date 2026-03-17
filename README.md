# SpotTrip

This workspace contains one active TourGuide app.

## Use These Paths

- `app/tourguide-frontend-fresh/`: active Svelte frontend
- `app/backend/`: active Django backend

## Start The App

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
4. Start the server:
   ```
   python manage.py runserver
   ```

### Frontend
1. Navigate to `app/tourguide-frontend-fresh/`.
2. Install dependencies:
   ```
   pnpm install
   ```
3. Start the dev server:
   ```
   pnpm run dev
   ```
4. Open:
   ```
   http://localhost:5173/
   ```

## Notes

- The older duplicate app trees have been removed.
- If Vite reports a different port, use the URL shown in the terminal.