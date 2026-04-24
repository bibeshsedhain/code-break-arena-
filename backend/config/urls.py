from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # This line tells Django: "Any URL that starts with 'api/', 
    # chop off the 'api/' and send the rest to backend/api/urls.py"
    path('api/', include('api.urls')),
]