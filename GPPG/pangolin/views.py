from django.shortcuts import render, redirect
from django.db.models import Count
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from .models import *
from django.http import JsonResponse, HttpResponse
from django.template.response import TemplateResponse
from django.shortcuts import get_object_or_404
from datetime import datetime, timedelta
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib import messages
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.views.decorators.http import require_POST
from django.views.generic.list import ListView
from django.contrib.admin.models import LogEntry, ADDITION, CHANGE, DELETION
from django.contrib.auth.mixins import UserPassesTestMixin
from django.contrib.contenttypes.models import ContentType
from django.views.generic.edit import CreateView, UpdateView, DeleteView
from django.urls import reverse, reverse_lazy
from .forms import *
from django.db.models import Q
from django.contrib.auth.views import PasswordResetView
from django.contrib.messages.views import SuccessMessageMixin
from django.views.decorators.cache import cache_page
from django.contrib.auth.hashers import make_password, check_password
import json
from .models import User
from .decorator import *
from dotenv import load_dotenv
import google.generativeai as genai
from django.conf import settings
import logging
from allauth.socialaccount.models import SocialAccount
import random
import string
from django.core.mail import send_mail
from datetime import datetime, timedelta
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.contrib.auth import views as auth_views
from django.contrib.auth.tokens import default_token_generator
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.contrib.auth.forms import PasswordResetForm
from django.utils.crypto import get_random_string
import time
import hashlib
from django.views import View
from django.views.decorators.csrf import csrf_protect
from django.http import JsonResponse, HttpResponseServerError
# Set up logging
logger = logging.getLogger(__name__)
# PUBLIC


@guest_only
def landing_page(request):
    return render(request, 'public/landing_page.html')


class PasswordResetView(View):
    TOKEN_EXPIRY_HOURS = 24

    @staticmethod
    def generate_token():
        random_string = get_random_string(32)
        timestamp = str(int(time.time()))
        return hashlib.sha256(f"{random_string}{timestamp}".encode()).hexdigest()

    def post(self, request):
        data = json.loads(request.body)
        email = data.get('email')

        if not email:
            return JsonResponse({
                'status': 'error',
                'message': 'Email is required.'
            }, status=400)

        try:
            user = User.objects.get(user_email=email)
            token = self.generate_token()
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            reset_url = f"{request.scheme}://{request.get_host()}/reset/{uid}/{token}/"

            # Store token in session with timestamp
            expiry_time = int(time.time()) + (self.TOKEN_EXPIRY_HOURS * 3600)
            request.session[f'password_reset_token_{uid}'] = {
                'token': token,
                'timestamp': int(time.time()),
                'expiry': expiry_time
            }

            context = {
                'user': {
                    'email': email,
                    'get_full_name': f"{user.user_firstname} {user.user_lastname}",
                },
                'reset_url': reset_url,
                'site_name': settings.SITE_NAME,
                'expiration_time': f'{self.TOKEN_EXPIRY_HOURS} hours'
            }

            email_html = render_to_string(
                'public/password_reset_email.html', context)
            email_text = render_to_string(
                'public/password_reset_subject.txt', context)

            msg = EmailMultiAlternatives(
                subject=f"{context['site_name']} - Password Reset",
                body=email_text,
                from_email=settings.EMAIL_HOST_USER,
                to=[email]
            )
            msg.attach_alternative(email_html, "text/html")
            msg.send()

            return JsonResponse({
                'status': 'success',
                'message': 'Password reset email sent successfully.'
            })

        except User.DoesNotExist:
            return JsonResponse({
                'status': 'success',
                'message': 'If an account exists with this email, a password reset link will be sent.'
            })


@method_decorator(csrf_protect, name='dispatch')
class PasswordResetConfirmView(View):
    template_name = 'public/password_reset_confirm.html'

    def get(self, request, uidb64, token):
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)
            return render(request, self.template_name, {'validlink': True})
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return render(request, self.template_name, {'validlink': False})

    def post(self, request, uidb64, token):
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)

            password1 = request.POST.get('new_password1')
            password2 = request.POST.get('new_password2')

            if password1 and password2 and password1 == password2:
                # Use Django's make_password
                from django.contrib.auth.hashers import make_password
                user.password = make_password(password1)
                user.save()

                messages.success(
                    request, 'Your password has been set. You may go ahead and log in now.')
                return redirect('landing_page')
            else:
                messages.error(request, 'Passwords do not match.')
                return render(request, self.template_name, {'validlink': True})

        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return render(request, self.template_name, {'validlink': False})


class OTPHandler:
    def __init__(self):
        self.otps = {}  # Store OTPs with expiration time

    def generate_otp(self):
        """Generate a 6-digit OTP"""
        return ''.join(random.choices(string.digits, k=6))

    def store_otp(self, identifier, otp):
        """Store OTP with 5-minute expiration"""
        expiration = datetime.now() + timedelta(minutes=5)
        self.otps[identifier] = {'otp': otp, 'expiration': expiration}

    def verify_otp(self, identifier, otp):
        """Verify OTP and check expiration"""
        if identifier not in self.otps:
            return False

        stored = self.otps[identifier]
        if datetime.now() > stored['expiration']:
            del self.otps[identifier]
            return False

        if stored['otp'] == otp:
            del self.otps[identifier]
            return True

        return False

    def send_otp_email(self, email, otp):
        user_data = {
            'email': email,
            'get_full_name': email.split('@')[0]
        }

        context = {
            'user': user_data,
            'otp': otp,
            'site_name': settings.SITE_NAME,
            'expiration_time': 5,
        }

        email_html = render_to_string('public/otpTemp.html', context)
        email_text = render_to_string('public/otpTemp.txt', context)

        try:
            subject = f"{context['site_name']} - Verify Your Email"
            msg = EmailMultiAlternatives(
                subject=subject,
                body=email_text,
                from_email=settings.EMAIL_HOST_USER,
                to=[email]
            )

            msg.attach_alternative(email_html, "text/html")
            msg.send()
            return True

        except Exception as e:
            logger.error(f"Failed to send OTP email to {email}: {str(e)}")
            return False


otp_handler = OTPHandler()


@csrf_exempt
def signup(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)

            # Validate required fields
            required_fields = ['user_firstname', 'user_lastname',
                               'user_email', 'password', 'contact']
            for field in required_fields:
                if not data.get(field):
                    return JsonResponse({
                        'status': 'error',
                        'message': f'{field} is required'
                    }, status=400)

            # Check if email already exists
            if User.objects.filter(user_email=data['user_email']).exists():
                return JsonResponse({
                    'status': 'error',
                    'message': 'Email already exists'
                }, status=400)

            # Validate contact number
            if not data['contact'].isdigit() or len(data['contact']) != 11:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Invalid contact number format'
                }, status=400)

            # Store user data in session
            request.session['pending_user'] = {
                'user_firstname': data['user_firstname'],
                'user_lastname': data['user_lastname'],
                'user_email': data['user_email'],
                'password': data['password'],
                'contact': data['contact']
            }

            # Generate and send OTP
            otp = otp_handler.generate_otp()
            otp_handler.store_otp(data['user_email'], otp)

            if not otp_handler.send_otp_email(data['user_email'], otp):
                return JsonResponse({
                    'status': 'error',
                    'message': 'Failed to send OTP email'
                }, status=500)

            return JsonResponse({
                'status': 'success',
                'message': 'OTP sent successfully',
                'require_otp': True
            })

        except json.JSONDecodeError:
            return JsonResponse({
                'status': 'error',
                'message': 'Invalid JSON format'
            }, status=400)
        except Exception as e:
            logger.error(f"Signup error: {str(e)}")
            return JsonResponse({
                'status': 'error',
                'message': 'An error occurred during signup'
            }, status=500)


@csrf_exempt
def verify_otp(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            pending_user = request.session.get('pending_user')

            if not pending_user:
                return JsonResponse({
                    'status': 'error',
                    'message': 'No pending registration found'
                }, status=400)

            if otp_handler.verify_otp(pending_user['user_email'], data['otp']):
                # Create user after OTP verification
                user = User.objects.create(
                    user_firstname=pending_user['user_firstname'],
                    user_lastname=pending_user['user_lastname'],
                    user_email=pending_user['user_email'],
                    password=make_password(pending_user['password']),
                    contact=pending_user['contact']
                )

                # Clear pending user data
                del request.session['pending_user']

                # Set session
                request.session['user_id'] = user.id
                request.session['user_email'] = user.user_email

                return JsonResponse({
                    'status': 'success',
                    'message': 'User created successfully',
                    'user': {
                        'user_firstname': user.user_firstname,
                        'user_email': user.user_email
                    }
                })
            else:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Invalid or expired OTP'
                }, status=400)

        except json.JSONDecodeError:
            return JsonResponse({
                'status': 'error',
                'message': 'Invalid JSON format'
            }, status=400)
        except Exception as e:
            logger.error(f"OTP verification error: {str(e)}")
            return JsonResponse({
                'status': 'error',
                'message': 'An error occurred during OTP verification'
            }, status=500)


@csrf_exempt
def resend_otp(request):
    if request.method == 'POST':
        try:
            pending_user = request.session.get('pending_user')

            if not pending_user:
                return JsonResponse({
                    'status': 'error',
                    'message': 'No pending registration found'
                }, status=400)

            # Generate and send new OTP
            otp = otp_handler.generate_otp()
            otp_handler.store_otp(pending_user['user_email'], otp)

            if not otp_handler.send_otp_email(pending_user['user_email'], otp):
                return JsonResponse({
                    'status': 'error',
                    'message': 'Failed to send OTP email'
                }, status=500)

            return JsonResponse({
                'status': 'success',
                'message': 'OTP resent successfully'
            })

        except Exception as e:
            logger.error(f"OTP resend error: {str(e)}")
            return JsonResponse({
                'status': 'error',
                'message': 'An error occurred while resending OTP'
            }, status=500)


@csrf_exempt
@guest_only
def login(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')

            try:
                user = User.objects.get(user_email=email)
            except User.DoesNotExist:
                return JsonResponse({'status': 'error', 'message': 'Invalid credentials'}, status=400)

            if check_password(password, user.password):
                request.session['user_id'] = user.id
                request.session['user_email'] = user.user_email

                return JsonResponse({
                    'status': 'success',
                    'message': 'Login successful',
                    'user': {
                        'first_name': user.user_firstname,
                        'email': user.user_email
                    }
                })
            else:
                return JsonResponse({'status': 'error', 'message': 'Invalid credentials'}, status=400)

        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

    # Handle GET request
    return render(request, 'public/login.html')


@csrf_exempt
def google_login_callback(request):
    """
    Handle successful Google login
    """
    try:
        if not request.user.is_authenticated:
            return redirect('landing_page')

        social_account = SocialAccount.objects.filter(
            user=request.user,
            provider='google'
        ).first()

        if social_account:
            google_data = social_account.extra_data
            email = google_data.get('email')

            # Find or create your custom user
            try:
                user = User.objects.get(user_email=email)
            except User.DoesNotExist:
                user = User.objects.create(
                    email=email,
                    first_name=google_data.get('given_name', ''),
                    last_name=google_data.get('family_name', ''),
                    password=make_password(None)  # Unusable password
                )

            # Set your custom session
            request.session['user_id'] = user.id
            request.session['user_email'] = user.user_email

            return redirect('home')

        logger.error("No social account found")
        return redirect('landing_page')

    except Exception as e:
        logger.error(f"Google login error: {str(e)}")
        return redirect('landing_page')


def logout(request):
    auth_logout(request)
    return redirect(settings.LOGOUT_REDIRECT_URL)


def public_about(request):
    return render(request, 'public/about.html')


def public_officers(request):
    presidents = Officer.objects.filter(position='President')
    vice_presidents = Officer.objects.filter(position='Vice President')
    secretary = Officer.objects.filter(position='Secretary')
    treasurer = Officer.objects.filter(position='Treasurer')
    auditor = Officer.objects.filter(position='Auditor')
    pio_internal = Officer.objects.filter(position='Pio Internal')
    pio_external = Officer.objects.filter(position='Pio External')
    business_manager = Officer.objects.filter(position='Business Manager')
    return render(request, 'public/officers.html', {
        'president': presidents,
        'vice_president': vice_presidents,
        'secretary': secretary,
        'treasurer': treasurer,
        'auditor': auditor,
        'pio_internal': pio_internal,
        'pio_external': pio_external,
        'business_manager': business_manager,
    })


# PRIVATE

@login_required
def home(request):
    try:
        user_id = request.session.get('user_id')
        if not user_id:
            raise User.DoesNotExist

        user = User.objects.get(id=user_id)
        return render(request, 'private/index.html', {'user': user})
    except User.DoesNotExist:
        request.session.flush()
        return redirect('landing_page')


def initialize_genai():
    # Gemini AI with API key from settings
    try:
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            logger.error("GEMINI_API_KEY not found in settings")
            return None

        genai.configure(api_key=api_key)

        model = genai.GenerativeModel(
            model_name='tunedModels/palawan-pangolin-quiojp7cizr2',  # my tune api gemini bot
            generation_config={
                'temperature': 0.9,
                'top_p': 0.95,
                'top_k': 40,
                'max_output_tokens': 2048,
            }
        )
        return model
    except Exception as e:
        logger.error(f"Error initializing Gemini API: {str(e)}")
        return None


def is_pangolin_related(text):
    pangolin_keywords = [
        'pangolin', 'pangolinidae', 'scaly anteater', 'manis', 'pholidota',
        'scales', 'ant', 'termite', 'palawan', 'wildlife', 'endangered',
        'conservation', 'philippines', 'manis culionensis', 'trade', 'poaching',
        'habitat', 'nocturnal', 'mammal', 'species'
    ]
    text_lower = text.lower()
    return any(keyword in text_lower for keyword in pangolin_keywords)


@csrf_exempt
def send_message(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_message = data.get('message', '').strip()

            if not user_message:
                return JsonResponse({
                    'status': 'error',
                    'response': 'Please enter a message.'
                })

            if not is_pangolin_related(user_message):
                return JsonResponse({
                    'status': 'success',
                    'response': "I apologize, but I'm specifically designed to discuss pangolins and related topics. Could you please ask me something about pangolins? For example, you could ask about:\n\n" +
                                "• Pangolin characteristics and behavior\n" +
                                "• Pangolin conservation efforts\n" +
                                "• The Palawan pangolin species\n" +
                                "• Pangolin habitat and diet\n" +
                                "• Threats to pangolin survival"
                })

            model = initialize_genai()
            if not model:
                logger.error("Failed to initialize Gemini model")
                return JsonResponse({
                    'status': 'error',
                    'response': 'Chat service is temporarily unavailable. Please try again later.'
                }, status=500)

            try:
                context_prompt = f"""
                Acting as a pangolin expert, please provide accurate information about pangolins in response to this question: {user_message}
                Keep the response focused on pangolin-related information.
                If possible, relate the answer specifically to the Palawan pangolin (Manis culionensis).
                Include scientific facts and conservation information when relevant.
                """

                chat = model.start_chat(history=[])
                response = chat.send_message(context_prompt)

                if response and response.text:
                    return JsonResponse({
                        'status': 'success',
                        'response': response.text
                    })
                else:
                    logger.error("Empty response from model")
                    return JsonResponse({
                        'status': 'error',
                        'response': 'I apologize, but I had trouble processing your question. Please try again.'
                    }, status=500)

            except Exception as e:
                logger.error(f"Error getting model response: {str(e)}")
                return JsonResponse({
                    'status': 'error',
                    'response': 'I apologize, but I had trouble processing your question. Please try again.'
                }, status=500)

        except json.JSONDecodeError:
            logger.error("Invalid JSON in request body")
            return JsonResponse({
                'status': 'error',
                'response': 'Invalid request format. Please send a valid message.'
            }, status=400)

        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            return JsonResponse({
                'status': 'error',
                'response': 'An unexpected error occurred. Please try again later.'
            }, status=500)

    return JsonResponse({
        'status': 'error',
        'response': 'Invalid request method.'
    }, status=400)


@login_required
def gallery(request):
    latest_images = Gallery.objects.filter(
        media_type='Image').order_by('-created_at')[:5]
    next_images = Gallery.objects.filter(
        media_type='Image').order_by('-created_at')[5:10]

    context = {
        'latest_images': latest_images,
        'next_images': next_images,
    }
    return render(request, 'private/gallery.html', context)


@login_required
def gallery_video(request):
    latest_videos = Gallery.objects.filter(
        media_type='Video').order_by('-created_at')[:5]
    next_videos = Gallery.objects.filter(
        media_type='Video').order_by('-created_at')[5:10]
    context = {
        'latest_videos': latest_videos,
        'next_videos': next_videos,
    }
    return render(request, 'private/gallery_video.html', context)


@login_required
def about(request):
    return render(request, 'private/about.html')


@login_required
def activities(request):
    # Get latest 5 events
    latest_events = Event.objects.all().order_by('-date')[:5]
    # Get all events for the alternating sections
    all_events = Event.objects.all().order_by('-date')
    return render(request, 'private/activities.html', {
        'latest_events': latest_events,
        'all_events': all_events
    })


@login_required
def trend(request):
    return render(request, 'private/trend.html')


@login_required
def officers(request):
    presidents = Officer.objects.filter(position='President')
    vice_presidents = Officer.objects.filter(position='Vice President')
    secretary = Officer.objects.filter(position='Secretary')
    treasurer = Officer.objects.filter(position='Treasurer')
    auditor = Officer.objects.filter(position='Auditor')
    pio_internal = Officer.objects.filter(position='Pio Internal')
    pio_external = Officer.objects.filter(position='Pio External')
    business_manager = Officer.objects.filter(position='Business Manager')
    return render(request, 'private/officers.html', {
        'president': presidents,
        'vice_president': vice_presidents,
        'secretary': secretary,
        'treasurer': treasurer,
        'auditor': auditor,
        'pio_internal': pio_internal,
        'pio_external': pio_external,
        'business_manager': business_manager,
    })


@login_required
def maps(request):
    return render(request, 'private/maps.html')


@login_required
def account_view(request):
    return render(request, 'private/account_view.html')


@login_required
def user_update_private(request, id):
    user = get_object_or_404(User, id=id)

    if request.method == 'POST':
        form = UserFormPrivate(request.POST, request.FILES, instance=user)
        if form.is_valid():
            form.save()
            response = HttpResponse()
            response.headers['HX-Trigger'] = 'closeAndRefresh'
            messages.success(request, 'User Updated!')
            return response
        else:

            return render(request, 'admin/includes/modal/modal_user_edit_private.html', {
                'form': form,
                'user': user,
            })

    form = UserFormPrivate(instance=user)
    return render(request, 'admin/includes/modal/modal_user_edit_private.html', {
        'form': form,
        'user': user
    })

# ADMIN


def admin_required(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):

        if not request.user.is_authenticated:
            return redirect('admin_login')

        if not request.user.is_staff:
            return redirect('admin_login')
        return view_func(request, *args, **kwargs)
    return _wrapped_view


@admin_required
def admin_home(request):
    # Initialize overall trend data
    overall_trend = {
        'alive': 0,
        'dead': 0,
        'scales': 0,
        'illegal_trade': 0,
    }

    # Aggregate data by status and count occurrences
    aggregated_data = Incident.objects.values(
        'status').annotate(count=Count('id'))

    for entry in aggregated_data:
        status = entry['status']  # Get the status
        count = entry['count']    # Get the count

        # Update the overall trend counts based on status
        if status == 'Alive':
            overall_trend['alive'] += count
        elif status == 'Dead':
            overall_trend['dead'] += count
        elif status == 'Scales':
            overall_trend['scales'] += count
        elif status == 'Illegal Trade':
            overall_trend['illegal_trade'] += count

    # Prepare the response with the total count for each status
    response_data = {
        'overall_trend': overall_trend,
    }

    return render(request, 'admin/admin.html', response_data)


def admin_login(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(request, username=username, password=password)

        if user is not None and user.is_staff:
            auth_login(request, user)
            return redirect('admin_home')
        else:
            return render(request, 'admin/login_admin.html', {'error': 'Invalid username or password'})

    return render(request, 'admin/login_admin.html')


def admin_logout(request):
    auth_logout(request)
    return redirect(settings.ADMIN_LOGOUT_REDIRECT_URL)


@method_decorator(admin_required, name='dispatch')
class IncidentListView(ListView):
    model = Incident
    context_object_name = "incident"
    template_name = "admin/database_incident.html"

    def get_queryset(self):
        queryset = super().get_queryset()
        status_filter = self.request.GET.getlist('status')

        if status_filter:
            query = Q()
            for status in status_filter:
                query |= Q(status=status)
            queryset = queryset.filter(query)

        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['status_options'] = [
            'Dead', 'Alive', 'Scales', 'Illegal Trade']
        context['selected_statuses'] = self.request.GET.getlist('status')

        return context


def incident_add(request):
    if request.method == 'POST':
        form = IncidentForm(request.POST)
        if form.is_valid():
            incident = form.save()

            LogEntry.objects.log_action(
                user_id=request.user.id,
                content_type_id=ContentType.objects.get_for_model(Incident).pk,
                object_id=incident.pk,
                object_repr=str(incident),
                action_flag=ADDITION,
                change_message="Added a new Incident"
            )

            response = HttpResponse()
            response.headers['HX-Trigger'] = 'closeAndRefresh'
            messages.success(request, 'Incident Saved and logged!')
            return response
    else:
        form = IncidentForm()

    return render(request, 'admin/includes/modal/modal_incident_add.html', {'form': form})


def incident_update(request, id):
    incident = get_object_or_404(Incident, id=id)

    if request.method == 'POST':
        form = IncidentForm(request.POST, instance=incident)
        if form.is_valid():
            form.save()

            LogEntry.objects.log_action(
                user_id=request.user.id,
                content_type_id=ContentType.objects.get_for_model(Incident).pk,
                object_id=incident.pk,
                object_repr=str(incident),
                action_flag=CHANGE,
                change_message="Updated an incident"
            )

            response = HttpResponse()
            response.headers['HX-Trigger'] = 'closeAndRefresh'
            messages.success(request, 'Incident Updated!')
            return response
        else:

            return render(request, 'admin/includes/modal/modal_incident_edit.html', {
                'form': form,
                'incident': incident,
            })

    form = IncidentForm(instance=incident)
    return render(request, 'admin/includes/modal/modal_incident_edit.html', {
        'form': form,
        'incident': incident
    })


def incident_delete(request, id):
    incident = get_object_or_404(Incident, id=id)

    if request.method == 'POST':

        LogEntry.objects.log_action(
            user_id=request.user.id,
            content_type_id=ContentType.objects.get_for_model(Incident).pk,
            object_id=incident.pk,
            object_repr=str(incident),
            action_flag=DELETION,
            change_message="Deleted an incident"
        )

        incident.delete()
        response = HttpResponse()
        response.headers['HX-Trigger'] = 'closeAndRefresh'
        messages.success(request, 'Incident Deleted!')
        return response
    else:
        return render(request, 'admin/includes/modal/modal_incident_delete.html', {
            'incident': incident
        })


def pangolin_activities(request):
    return render(request, 'admin/database_activities.html')


def userAccounts_database(request):
    return render(request, 'admin/database_userAccounts.html')


@method_decorator(admin_required, name='dispatch')
class EventListView(ListView):
    model = Event
    context_object_name = "events"
    template_name = "admin/database_activities.html"


def activity_add(request):
    if request.method == 'POST':
        form = EventForm(request.POST, request.FILES)
        if form.is_valid():
            event = form.save()

            LogEntry.objects.log_action(
                user_id=request.user.id,
                content_type_id=ContentType.objects.get_for_model(Event).pk,
                object_id=event.pk,
                object_repr=str(event),
                action_flag=ADDITION,
                change_message="Added a new Event"
            )

            response = HttpResponse()
            response.headers['HX-Trigger'] = 'closeAndRefresh'
            messages.success(request, 'Acitivity Saved!')
            return response
    else:
        form = EventForm()

    return render(request, 'admin/includes/modal/modal_activities_add.html', {'form': form})


def activity_update(request, id):
    event = get_object_or_404(Event, id=id)

    if request.method == 'POST':
        form = EventForm(request.POST, request.FILES, instance=event)
        if form.is_valid():
            form.save()

            LogEntry.objects.log_action(
                user_id=request.user.id,
                content_type_id=ContentType.objects.get_for_model(Event).pk,
                object_id=event.pk,
                object_repr=str(event),
                action_flag=CHANGE,
                change_message="Updated an Event"
            )

            response = HttpResponse()
            response.headers['HX-Trigger'] = 'closeAndRefresh'
            messages.success(request, 'Activity Updated!')
            return response
        else:

            return render(request, 'admin/includes/modal/modal_activities_edit.html', {
                'form': form,
                'event': event,
            })

    form = EventForm(instance=event)
    return render(request, 'admin/includes/modal/modal_activities_edit.html', {
        'form': form,
        'event': event
    })


def activity_delete(request, id):
    event = get_object_or_404(Event, id=id)

    if request.method == 'POST':
        LogEntry.objects.log_action(
            user_id=request.user.id,
            content_type_id=ContentType.objects.get_for_model(Event).pk,
            object_id=event.pk,
            object_repr=str(event),
            action_flag=DELETION,
            change_message="Deleted an Event"
        )
        event.delete()
        response = HttpResponse()
        response.headers['HX-Trigger'] = 'closeAndRefresh'
        messages.success(request, 'Gallery Record Deleted!')
        return response
    else:
        return render(request, 'admin/includes/modal/modal_activities_delete.html', {
            'event': event
        })


@method_decorator(admin_required, name='dispatch')
class UserListView(ListView):
    model = User
    context_object_name = "users"
    template_name = "admin/database_useracc.html"


def user_add(request):
    if request.method == 'POST':
        form = UserForm(request.POST, request.FILES)
        if form.is_valid():
            user = form.save()

            LogEntry.objects.log_action(
                user_id=request.user.id,
                content_type_id=ContentType.objects.get_for_model(User).pk,
                object_id=user.pk,
                object_repr=str(user),
                action_flag=ADDITION,
                change_message="Added a new User"
            )
            response = HttpResponse()
            response.headers['HX-Trigger'] = 'closeAndRefresh'
            messages.success(request, 'User Saved!')
            return response
    else:
        form = UserForm()

    return render(request, 'admin/includes/modal/modal_user_add.html', {'form': form})


def user_update(request, id):
    user = get_object_or_404(User, id=id)

    if request.method == 'POST':
        form = UserForm(request.POST, request.FILES, instance=user)
        if form.is_valid():
            form.save()

            LogEntry.objects.log_action(
                user_id=request.user.id,
                content_type_id=ContentType.objects.get_for_model(User).pk,
                object_id=user.pk,
                object_repr=str(user),
                action_flag=CHANGE,
                change_message="User Updated"
            )
            response = HttpResponse()
            response.headers['HX-Trigger'] = 'closeAndRefresh'
            messages.success(request, 'User Updated!')
            return response
        else:

            return render(request, 'admin/includes/modal/modal_user_edit.html', {
                'form': form,
                'user': user,
            })

    form = UserForm(instance=user)
    return render(request, 'admin/includes/modal/modal_user_edit.html', {
        'form': form,
        'user': user
    })


def user_delete(request, id):
    user = get_object_or_404(User, id=id)

    if request.method == 'POST':

        LogEntry.objects.log_action(
            user_id=request.user.id,
            content_type_id=ContentType.objects.get_for_model(User).pk,
            object_id=user.pk,
            object_repr=str(user),
            action_flag=DELETION,
            change_message="User Deleted"
        )
        user.delete()
        response = HttpResponse()
        response.headers['HX-Trigger'] = 'closeAndRefresh'
        messages.success(request, 'User Deleted!')
        return response
    else:
        return render(request, 'admin/includes/modal/modal_user_delete.html', {
            'user': user
        })


@method_decorator(admin_required, name='dispatch')
class GalleryListView(ListView):
    model = Gallery
    context_object_name = "gallery_items"
    template_name = "admin/database_gallery.html"


def gallery_add(request):
    if request.method == 'POST':
        form = GalleryForm(request.POST, request.FILES)
        if form.is_valid():
            gallery = form.save()

            LogEntry.objects.log_action(
                user_id=request.user.id,
                content_type_id=ContentType.objects.get_for_model(Gallery).pk,
                object_id=gallery.pk,
                object_repr=str(gallery),
                action_flag=ADDITION,
                change_message="Added a Media to Gallery"
            )
            response = HttpResponse()
            response.headers['HX-Trigger'] = 'closeAndRefresh'
            messages.success(request, 'Gallery Record Saved!')
            return response
    else:
        form = GalleryForm()

    return render(request, 'admin/includes/modal/modal_gallery_add.html', {'form': form})


def gallery_update(request, id):
    gallery = get_object_or_404(Gallery, id=id)

    if request.method == 'POST':
        form = GalleryForm(request.POST, request.FILES, instance=gallery)
        if form.is_valid():
            form.save()

            LogEntry.objects.log_action(
                user_id=request.user.id,
                content_type_id=ContentType.objects.get_for_model(Gallery).pk,
                object_id=gallery.pk,
                object_repr=str(gallery),
                action_flag=CHANGE,
                change_message="Updated a Gallery Content"
            )
            response = HttpResponse()
            response.headers['HX-Trigger'] = 'closeAndRefresh'
            messages.success(request, 'Gallery Updated!')
            return response
        else:

            return render(request, 'admin/includes/modal/modal_gallery_edit.html', {
                'form': form,
                'gallery': gallery,
            })

    form = GalleryForm(instance=gallery)
    return render(request, 'admin/includes/modal/modal_gallery_edit.html', {
        'form': form,
        'gallery': gallery
    })


def gallery_delete(request, id):
    gallery = get_object_or_404(Gallery, id=id)

    if request.method == 'POST':

        LogEntry.objects.log_action(
            user_id=request.user.id,
            content_type_id=ContentType.objects.get_for_model(Gallery).pk,
            object_id=gallery.pk,
            object_repr=str(gallery),
            action_flag=DELETION,
            change_message="Media Deleted from Gallery"
        )
        gallery.delete()
        response = HttpResponse()
        response.headers['HX-Trigger'] = 'closeAndRefresh'
        messages.success(request, 'Gallery Record Deleted!')
        return response
    else:
        return render(request, 'admin/includes/modal/modal_gallery_delete.html', {
            'gallery': gallery
        })


@method_decorator(admin_required, name='dispatch')
class OfficerListView(ListView):
    model = Officer
    context_object_name = "officers"
    template_name = "admin/database_officers.html"


@admin_required
def admin_officers(request):
    presidents = Officer.objects.filter(position='President')
    vice_presidents = Officer.objects.filter(position='Vice President')
    secretary = Officer.objects.filter(position='Secretary')
    treasurer = Officer.objects.filter(position='Treasurer')
    auditor = Officer.objects.filter(position='Auditor')
    pio_internal = Officer.objects.filter(position='Pio Internal')
    pio_external = Officer.objects.filter(position='Pio External')
    business_manager = Officer.objects.filter(position='Business Manager')
    return render(request, 'admin/officers.html', {
        'president': presidents,
        'vice_president': vice_presidents,
        'secretary': secretary,
        'treasurer': treasurer,
        'auditor': auditor,
        'pio_internal': pio_internal,
        'pio_external': pio_external,
        'business_manager': business_manager,
    })


def officer_add(request):
    if request.method == 'POST':
        form = OfficerForm(request.POST, request.FILES)
        if form.is_valid():
            officer = form.save()

            LogEntry.objects.log_action(
                user_id=request.user.id,
                content_type_id=ContentType.objects.get_for_model(Officer).pk,
                object_id=officer.pk,
                object_repr=str(officer),
                action_flag=ADDITION,
                change_message="Added a new Officer"
            )
            response = HttpResponse()
            response.headers['HX-Trigger'] = 'closeAndRefresh'
            messages.success(request, 'Officer Saved!')
            return response
    else:
        form = OfficerForm()

    return render(request, 'admin/includes/modal/modal_officer_add.html', {'form': form})


def officer_update(request, id):
    officer = get_object_or_404(Officer, id=id)

    if request.method == 'POST':
        form = OfficerForm(request.POST, request.FILES, instance=officer)
        if form.is_valid():
            form.save()

            LogEntry.objects.log_action(
                user_id=request.user.id,
                content_type_id=ContentType.objects.get_for_model(Officer).pk,
                object_id=officer.pk,
                object_repr=str(officer),
                action_flag=CHANGE,
                change_message="Officer Updated"
            )
            response = HttpResponse()
            response.headers['HX-Trigger'] = 'closeAndRefresh'
            messages.success(request, 'Officer Updated!')
            return response
        else:

            return render(request, 'admin/includes/modal/modal_officer_edit.html', {
                'form': form,
                'officer': officer,
            })

    form = OfficerForm(instance=officer)
    return render(request, 'admin/includes/modal/modal_officer_edit.html', {
        'form': form,
        'officer': officer
    })


def officer_delete(request, id):
    officer = get_object_or_404(Officer, id=id)

    if request.method == 'POST':

        LogEntry.objects.log_action(
            user_id=request.user.id,
            content_type_id=ContentType.objects.get_for_model(Officer).pk,
            object_id=officer.pk,
            object_repr=str(officer),
            action_flag=DELETION,
            change_message="Officer Deleted"
        )
        officer.delete()
        response = HttpResponse()
        response.headers['HX-Trigger'] = 'closeAndRefresh'
        messages.success(request, 'Officer Deleted!')
        return response
    else:
        return render(request, 'admin/includes/modal/modal_officer_delete.html', {
            'officer': officer
        })


def admin_map(request):
    return render(request, 'admin/map.html')


@method_decorator(admin_required, name='dispatch')
class IncidentReportsListView(ListView):
    model = IncidentReport
    context_object_name = "reports"
    template_name = "admin/report.html"


def confirm_accept(request, report_id):
    report = get_object_or_404(IncidentReport, pk=report_id)
    return render(request, 'admin/includes/modal/modal_report_accept.html', {'report': report})

def accept_incident(request, report_id):
    
    report = get_object_or_404(IncidentReport, id=report_id)
    

    incident = Incident.objects.create(
        municity=report.municity,
        status=report.status,
        date_reported=report.date_reported,
        description=report.description,
    )

    LogEntry.objects.log_action(
                user_id=request.user.id,
                content_type_id=ContentType.objects.get_for_model(Incident).pk,
                object_id=incident.pk,
                object_repr=str(incident),
                action_flag=ADDITION,
                change_message="Report Accepted and Added to Incidents"
            )
    
    
    report.delete()
    
    messages.success(request, "Incident accepted and added to the database.")
    
    return redirect("admin_report")  

def confirm_cancel(request, report_id):
    report = get_object_or_404(IncidentReport, id=report_id)
    return render(request, 'admin/includes/modal/modal_report_cancel.html', {'report': report})


def cancel_incident(request, report_id):
    
    report = get_object_or_404(IncidentReport, id=report_id)

    LogEntry.objects.log_action(
                user_id=request.user.id,
                content_type_id=ContentType.objects.get_for_model(IncidentReport).pk,
                object_id=report.pk,
                object_repr=str(report),
                action_flag=DELETION,
                change_message="Report canceled and removed"
            )
    
    report.delete()
    
    messages.info(request, "Incident report removed.")
    response = HttpResponse()
    response.headers['HX-Trigger'] = 'closeAndRefresh'
    return response


def admin_charts(request):
    return render(request, 'admin/charts.html')


@method_decorator(admin_required, name='dispatch')
class AdminLogView(UserPassesTestMixin, ListView):
    model = LogEntry
    template_name = 'admin/profile.html'
    paginate_by = 6
    context_object_name = 'all_logs'  
    login_url = reverse_lazy('admin_login')

    def test_func(self):
        return self.request.user.is_staff

    def get_queryset(self):
        return LogEntry.objects.select_related('user').order_by('-action_time')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        context['user_logs'] = LogEntry.objects.filter(user=self.request.user).select_related('user').order_by('-action_time')

        for log in context['all_logs']:
            log.formatted_action = self.format_action(log)

        for log in context['user_logs']:
            log.formatted_action = self.format_action(log)

        return context

    def format_action(self, log):
        if log.action_flag == 1:
            return f"{log.change_message}"
        elif log.action_flag == 2:
            return f"{log.change_message}"
        elif log.action_flag == 3:
            return f"{log.change_message}"
        else:
            return "No action specified"



# QUERIES


def get_poaching_trends(request):

    period = request.GET.get('period', 'overall')

    # Initialize overall trend data
    overall_trend = {
        'alive': [0] * 12,
        'dead': [0] * 12,
        'scales': [0] * 12,
        'illegal_trade': [0] * 12,
    }

    yearly_reports = {}

    # Get all reports regardless of the year for yearly reporting
    reports = Incident.objects.all()

    # Aggregate data for overall trend and yearly reports
    aggregated_data = reports.values(
        'date_reported__year', 'date_reported__month', 'status').annotate(count=Count('id'))

    for entry in aggregated_data:
        month_index = entry['date_reported__month'] - \
            1
        status = entry['status']
        count = entry['count']

        # Update overall trend
        if status == 'Alive':
            overall_trend['alive'][month_index] += count
        elif status == 'Dead':
            overall_trend['dead'][month_index] += count
        elif status == 'Scales':
            overall_trend['scales'][month_index] += count
        elif status == 'Illegal Trade':
            overall_trend['illegal_trade'][month_index] += count

        # Update yearly reports with monthly breakdown
        year = entry['date_reported__year']
        if year not in yearly_reports:
            yearly_reports[year] = {
                'alive': [0] * 12,
                'dead': [0] * 12,
                'scales': [0] * 12,
                'illegal_trade': [0] * 12,
            }

        if status == 'Alive':
            yearly_reports[year]['alive'][month_index] += count
        elif status == 'Dead':
            yearly_reports[year]['dead'][month_index] += count
        elif status == 'Scales':
            yearly_reports[year]['scales'][month_index] += count
        elif status == 'Illegal Trade':
            yearly_reports[year]['illegal_trade'][month_index] += count

    response_data = {
        'overall_trend': overall_trend,
        'yearly_reports': yearly_reports,
    }

    return JsonResponse(response_data)


def get_chart_data(request):
    period = request.GET.get('period', 'overall')
    status_filter = request.GET.get('status', None)
    
    statuses = ['Alive', 'Dead', 'Scales', 'Illegal Trade']
    if status_filter:
        # Split the comma-separated statuses
        statuses = [s.strip() for s in status_filter.split(',')]
    
    trends = {status: {'overall': [0] * 12, 'yearly': {}}
             for status in statuses}
    
    reports = Incident.objects.all()
    if status_filter:
        reports = reports.filter(status__in=statuses)
    
    aggregated_data = reports.values(
        'date_reported__year', 'date_reported__month', 'status'
    ).annotate(count=Count('id'))
    
    # First, collect all the data as before
    for entry in aggregated_data:
        month_index = entry['date_reported__month'] - 1
        status = entry['status']
        count = entry['count']
        year = entry['date_reported__year']
        
        if status in trends:
            trends[status]['overall'][month_index] += count
            
            if year not in trends[status]['yearly']:
                trends[status]['yearly'][year] = [0] * 12
            trends[status]['yearly'][year][month_index] += count
    
    # Now reorganize the yearly data with sorted years
    sorted_trends = {}
    for status in statuses:
        yearly_data = trends[status]['yearly']
        # Sort years in descending order and create new ordered dictionary
        sorted_years = dict(sorted(
            yearly_data.items(),
            key=lambda x: x[0],  # Sort by year
            reverse=True  # Sort in descending order
        ))
        
        sorted_trends[f"{status.lower()}_trend"] = {
            'overall': trends[status]['overall'],
            'yearly': sorted_years
        }
    
    return JsonResponse(sorted_trends)


def get_registereduser_data(request):

    years = User.objects.dates('created_at', 'year', order='ASC').values_list(
        'created_at__year', flat=True)

    # Organize data by months for each year
    data_by_year = {str(year): [0] * 12 for year in years}

    # Query and process the user data
    for year in years:
        users_per_month = (
            User.objects.filter(created_at__year=year)
            .values_list('created_at__month')
            .annotate(count=Count('id'))
        )
        for month, count in users_per_month:
            data_by_year[str(year)][month - 1] = count

    return JsonResponse(data_by_year)


def get_available_years(request):
    years = Incident.objects.dates('date_reported', 'year').distinct()
    available_years = [year.year for year in years]
    available_years.sort(reverse=True)
    return JsonResponse(available_years, safe=False)


def get_region_data(request):
    # Define regions and their corresponding municipalities
    regions = {
        "North Palawan": ["Roxas", "San Vicente", "Dumaran", "El Nido", "Coron", "Busuanga", "Culion",
                          "Magsaysay", "Cagayancillo", "Araceli", "Agutaya", "Taytay", "Cuyo", "Linapacan"],
        "Central Palawan": ["Puerto Princesa City"],
        "South Palawan": ["Aborlan", "Narra", "Quezon", "Brooke's Point", "Sofronio Española",
                          "Rizal", "Bataraza", "Balabac"]
    }

    # Initialize response data structure
    region_data = {
        "North Palawan": {"dead": 0, "alive": 0, "scales": 0, "illegalTrades": 0},
        "Central Palawan": {"dead": 0, "alive": 0, "scales": 0, "illegalTrades": 0},
        "South Palawan": {"dead": 0, "alive": 0, "scales": 0, "illegalTrades": 0},
    }

    # Get all incidents and group by status, municipality
    incidents = Incident.objects.values(
        "municity", "status").annotate(count=Count("id"))

    # Aggregate data by region
    for incident in incidents:
        municity = incident["municity"]
        status = incident["status"]
        count = incident["count"]

        # Determine which region the municipality belongs to
        for region, municipalities in regions.items():
            if municity in municipalities:
                # Update counts based on status
                if status == "Dead":
                    region_data[region]["dead"] += count
                elif status == "Alive":
                    region_data[region]["alive"] += count
                elif status == "Scales":
                    region_data[region]["scales"] += count
                elif status == "Illegal Trade":
                    region_data[region]["illegalTrades"] += count

    return JsonResponse(region_data)


@cache_page(60 * 60 * 24)  # Cache for 24 hours
def get_geojson(request):
    try:
        file_path = os.path.join(settings.STATIC_ROOT,
                                 'maps', 'ClusterOfPalawan_filtereds.geojson')
        with open(file_path, 'r') as f:
            geojson_data = json.load(f)
        return JsonResponse(geojson_data)
    except Exception as e:
        return HttpResponseServerError(f"Error loading GeoJSON: {str(e)}")


def get_municity_data(request):
    data = (
        Incident.objects.values("municity")
        .annotate(
            dead=Count("id", filter=models.Q(status="Dead")),
            alive=Count("id", filter=models.Q(status="Alive")),
            scales=Count("id", filter=models.Q(status="Scales")),
            illegalTrades=Count("id", filter=models.Q(status="Illegal Trade")),
        )
        .order_by("municity")
    )

    response_data = {
        item["municity"]: {
            "dead": item["dead"],
            "alive": item["alive"],
            "scales": item["scales"],
            "illegalTrades": item["illegalTrades"],
        }
        for item in data
    }

    return JsonResponse(response_data)
