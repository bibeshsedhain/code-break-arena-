import os
import json
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
            
            # 1. Try to get the JSON string from the Render Environment Variable
            firebase_env_creds = os.environ.get('FIREBASE_SERVICE_ACCOUNT_JSON')

            if firebase_env_creds:
                try:
                    # Parse the raw JSON string back into a dictionary
                    cred_dict = json.loads(firebase_env_creds)
                    cred = credentials.Certificate(cred_dict)
                    firebase_admin.initialize_app(cred)
                    print("✅ Firebase Admin initialized via Render Environment Variable.")
                except Exception as e:
                    print(f"❌ CRITICAL ERROR: Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON: {e}")
            
            else:
                # 2. Fallback to Local Development physical file
                cred_path = os.path.join(settings.BASE_DIR, 'firebase-adminsdk.json')
                
                if os.path.exists(cred_path):
                    cred = credentials.Certificate(cred_path)
                    firebase_admin.initialize_app(cred)
                    print("✅ Firebase Admin initialized via Local JSON File.")
                else:
                    print("⚠️ WARNING: Firebase Service Account Key not found. Authentication will fail.")