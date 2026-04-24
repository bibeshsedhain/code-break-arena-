from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from firebase_admin import auth
from django.contrib.auth import get_user_model

User = get_user_model()

class FirebaseAuthentication(BaseAuthentication):
    """
    Custom authentication class that verifies Firebase JWTs.
    """
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        
        if not auth_header:
            return None # No header provided, DRF will handle permission denial

        # Ensure the header is in the format: "Bearer <token>"
        header_parts = auth_header.split(' ')
        if len(header_parts) != 2 or header_parts[0] != 'Bearer':
            raise AuthenticationFailed('Invalid Authorization header format. Expected "Bearer <token>".')

        id_token = header_parts[1]

        try:
            # Verify the token against Firebase servers
            decoded_token = auth.verify_id_token(id_token)
            uid = decoded_token.get('uid')
            email = decoded_token.get('email')

        except Exception as e:
            raise AuthenticationFailed(f'Invalid or expired Firebase token: {str(e)}')

        # Sync the Firebase user with the Django database
        # This gets the user if they exist, or creates them if this is their first login
        user, created = User.objects.get_or_create(username=uid, defaults={'email': email})

        # Return a tuple of (user, auth) as required by DRF
        return (user, None)