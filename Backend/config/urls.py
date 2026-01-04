
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from api.v1.views import api_docs_view, section_view

urlpatterns = [
    path('', api_docs_view, name='api-docs'),
    path('static/sections/<str:section_name>.html', section_view, name='section'),
    path('admin/', admin.site.urls),
    path('api/v1/', include('api.v1.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
