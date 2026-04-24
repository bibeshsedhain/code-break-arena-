import os
import firebase_admin
from firebase_admin import credentials
from django.apps import AppConfig
from django.conf import settings

class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        # Prevent Firebase from initializing multiple times during auto-reloads
        if not firebase_admin._apps:
            # Point this to the location of your downloaded JSON file
            cred_path = os.path.join(settings.BASE_DIR, 'firebase-adminsdk.json')
            
            # Ensure the file exists before attempting to initialize
            if os.path.exists(cred_path):
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred)
            else:
                print("WARNING: Firebase Service Account Key not found. Authentication will fail.")