from .base import *
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "localhost").split(",")

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=5),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
}


SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

CONN_MAX_AGE = 60


