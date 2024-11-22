# middleware.py
from django.shortcuts import redirect
from django.urls import reverse
from django.conf import settings
from django.contrib.auth import logout
from django.utils import timezone
from datetime import timedelta


class AuthenticationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        PUBLIC_URLS = [
            reverse('landing_page'),
            reverse('login'),
            reverse('signup'),
            '/accounts/',
            '/auth/google/',
            '/static/',
            '/media/',
        ]

        # Check if the path is public
        current_path = request.path
        is_public_url = any(current_path.startswith(url)
                            for url in PUBLIC_URLS)

        # Get authentication status
        is_authenticated = request.session.get('user_id') is not None

        if not is_authenticated and not is_public_url:
            return redirect('landing_page')
        elif is_authenticated and current_path in [reverse('landing_page'), reverse('login'), reverse('signup')]:
            return redirect('home')

        return self.get_response(request)


class SessionTimeoutMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.session.get('user_id'):
            last_activity = request.session.get('last_activity')

            if last_activity:
                last_activity = timezone.datetime.fromisoformat(last_activity)
                if timezone.now() > last_activity + timedelta(seconds=settings.SESSION_COOKIE_AUTO_LOGOUT):
                    request.session.flush()
                    return redirect('landing_page')

            # Update last activity timestamp
            request.session['last_activity'] = timezone.now().isoformat()

        response = self.get_response(request)
        return response
