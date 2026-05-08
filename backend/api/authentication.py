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
            
            # GUEST SUPPORT: Safely extract the email. 
            # If the token lacks an email (Anonymous), generate a dummy identifier using their UID.
            email = decoded_token.get('email', f'guest_{uid}@codebreak.local')
            
            # GUEST SUPPORT: Generate a default display name for the Leaderboard
            name = decoded_token.get('name', f'Ghost Protocol {uid[:4]}')

        except Exception as e:
            raise AuthenticationFailed(f'Invalid or expired Firebase token: {str(e)}')

        # Sync the Firebase user with the Django database
        # This gets the user if they exist, or creates them if this is their first login
        user, created = User.objects.get_or_create(
            username=uid, 
            defaults={
                'email': email,
                'first_name': name  # Populates a display name automatically for guests
            }
        )

        # Return a tuple of (user, auth) as required by DRF
        return (user, None)