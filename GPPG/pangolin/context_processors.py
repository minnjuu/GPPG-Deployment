from .models import *


def user_initials(request):
    user_id = request.session.get('user_id')
    if user_id:
        try:
            user = User.objects.get(id=user_id)

            initials = ''
            if user.user_firstname and user.user_lastname:
                initials = f"{user.user_firstname[0]}{user.user_lastname[0]}".upper(
                )
            elif user.user_firstname:
                initials = f"{user.user_firstname[0]}".upper()
            elif user.user_lastname:
                initials = f"{user.user_lastname[0]}".upper()

            name = f"{user.user_firstname or ''} {user.user_lastname or ''}".strip()

            return {
                'user': user,
                'initials': initials,
                'name': name
            }
        except User.DoesNotExist:
            return {}
        except Exception as e:
            # Log the error if needed
            print(f"Error in user_initials: {str(e)}")
            return {}
    return {}
