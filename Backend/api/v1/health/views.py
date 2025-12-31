from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import platform
import time
import os
import socket
import psutil
import uuid
from django.http import JsonResponse
from django.db import connections
from django.conf import settings
from django.utils.timezone import now


APP_START_TIME = time.time()
INSTANCE_ID = str(uuid.uuid4())[:8]


class HealthCheckView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        start_time = time.time()

        # ---- UPTIME ----
        uptime_seconds = int(time.time() - APP_START_TIME)

        # ---- DATABASE CHECK ----
        db_status = "unknown"
        db_latency_ms = None
        try:
            db_start = time.time()
            with connections["default"].cursor() as cursor:
                cursor.execute("SELECT 1")
            db_latency_ms = round((time.time() - db_start) * 1000, 2)
            db_status = "healthy"
        except Exception as e:
            db_status = "unhealthy"

        # ---- SYSTEM METRICS ----
        cpu_percent = psutil.cpu_percent(interval=0.1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage("/")

        # ---- PERFORMANCE ----
        response_time_ms = round((time.time() - start_time) * 1000, 2)

        # ---- FEATURE FLAGS (EXAMPLE) ----
        features = {
            "ai_enabled": os.getenv("AI_ENABLED", "false") == "true",
            "payments_enabled": os.getenv("PAYMENTS_ENABLED", "false") == "true",
            "beta_features": settings.DEBUG,
        }

        # ---- SECURITY POSTURE ----
        security = {
            "debug_mode": settings.DEBUG,
            "allowed_hosts_configured": bool(settings.ALLOWED_HOSTS),
            "https_enforced": not settings.DEBUG,
        }

        # ---- CONFIG SANITY ----
        config = {
            "secret_key_loaded": bool(settings.SECRET_KEY),
            "timezone": settings.TIME_ZONE,
            "database_engine": connections["default"].settings_dict.get("ENGINE"),
        }

        return Response(
            {
                "status": "healthy" if db_status == "healthy" else "degraded",
                "service": {
                    "name": "zuno-backend-api",
                    "environment": os.getenv("ENV", "development"),
                    "version": os.getenv("APP_VERSION", "v1.0.0"),
                    "instance_id": INSTANCE_ID,
                    "timestamp": now().isoformat(),
                },
                "system": {
                    "hostname": socket.gethostname(),
                    "os": platform.system(),
                    "os_version": platform.version(),
                    "architecture": platform.machine(),
                    "python_version": platform.python_version(),
                    "uptime_seconds": uptime_seconds,
                },
                "resources": {
                    "cpu_percent": cpu_percent,
                    "memory": {
                        "total_mb": round(memory.total / 1024 / 1024, 2),
                        "used_mb": round(memory.used / 1024 / 1024, 2),
                        "usage_percent": memory.percent,
                    },
                    "disk": {
                        "total_gb": round(disk.total / 1024 / 1024 / 1024, 2),
                        "used_gb": round(disk.used / 1024 / 1024 / 1024, 2),
                        "usage_percent": disk.percent,
                    },
                },
                "dependencies": {
                    "database": {
                        "status": db_status,
                        "latency_ms": db_latency_ms,
                    }
                },
                "features": features,
                "security": security,
                "config": config,
                "observability": {
                    "request_id": request.headers.get("X-Request-ID"),
                    "client_ip": request.META.get("REMOTE_ADDR"),
                    "region": os.getenv("AWS_REGION", "local"),
                    "response_time_ms": response_time_ms,
                }
            },
            status=status.HTTP_200_OK,
        )
