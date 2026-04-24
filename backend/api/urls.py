from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChallengeViewSet

# Initialize the router
router = DefaultRouter()

# Register the ViewSet. 
# The 'r' before the string denotes a raw string.
router.register(r'challenges', ChallengeViewSet, basename='challenge')

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('', include(router.urls)),
]