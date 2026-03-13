# TourGuide Django Backend

## Setup

1. Create a virtual environment and activate it:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Copy `.env.example` to `.env` and set your secrets and database URL.
4. Run initial project setup (after project is scaffolded):
   ```
   python manage.py migrate
   python manage.py createsuperuser
   ```
5. Run the server:
   ```
   python manage.py runserver
   ```
