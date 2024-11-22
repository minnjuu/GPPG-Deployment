from .models import *


def user_initials(request):
    user_id = request.session.get('user_id')
    if user_id:
        user = User.objects.get(id=user_id)
        initials = f"{user.user_firstname[0]}{user.user_lastname[0]}"
        name = f"{user.user_firstname} {user.user_lastname}"
        return {'user': user, 'initials': initials, 'name': name}
    return {}
