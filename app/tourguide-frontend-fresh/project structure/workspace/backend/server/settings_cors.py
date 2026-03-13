# CORS settings for Django
INSTALLED_APPS = [
    # ...existing apps...
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    # ...existing middleware...
]

CORS_ALLOW_ALL_ORIGINS = True
# Or for more security:
# CORS_ALLOWED_ORIGINS = [
#     'http://localhost:3000',
#     'http://127.0.0.1:3000',
# ]
