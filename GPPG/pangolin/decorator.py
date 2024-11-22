# decorators.py
from functools import wraps
from django.shortcuts import redirect
from django.http import JsonResponse


def login_required(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.session.get('user_id'):
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'status': 'error', 'message': 'Authentication required'}, status=401)
            return redirect('landing_page')
        return view_func(request, *args, **kwargs)
    return wrapper


def guest_only(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if request.session.get('id'):
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'status': 'error', 'message': 'Already authenticated'}, status=400)
            return redirect('home')
        return view_func(request, *args, **kwargs)
    return wrapper
