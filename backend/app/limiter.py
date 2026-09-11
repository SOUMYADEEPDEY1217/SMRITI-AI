"""
Shared slowapi Limiter instance. Lives in its own module (not app.main) so
routers can import it without creating a circular import with main.py,
which itself imports the routers to register them.
"""
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.config import settings

limiter = Limiter(key_func=get_remote_address, default_limits=[settings.RATE_LIMIT_DEFAULT])
