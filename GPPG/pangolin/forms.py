from django.forms import ModelForm

from django.forms import ModelForm, DateTimeInput
from django import forms
from .models import *
from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.forms import get_user_model
from django.core.exceptions import ValidationError
from django.core.validators import EmailValidator



class IncidentForm(forms.ModelForm):

    date_reported = forms.DateField(
        widget=forms.DateInput(attrs={
            'type': 'date',  # 'date' input type triggers browser date picker
            'class': 'bg-gray-50 border-b-2 border-t-0 border-x-0 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-0 focus:border-b-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-b-primary-600',
            'placeholder': 'Select Date',
        })
    )

    class Meta:
        model = Incident
        fields = "__all__"

        labels = {
            'municity': 'Municipality/City',
            'status': 'Status',
            'date_reported': 'Date Reported',
            'description': 'Description',
            'life_history': 'Life History',
            'weight': 'Body Weight',
            'sex': 'Sex',
            'obl_rolled': 'Overall Body Length (rolled)',
            'obl_stretched': 'Overall Body Length (stretched)',
            'ticks': 'Ticks',
            'feces': 'Feces',
        }

        widgets = {
            'municity': forms.Select(attrs={
                'class': 'bg-gray-50 border-b-2 border-t-0 border-x-0 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-0 focus:border-b-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-b-primary-600',
                'placeholder': 'Enter Municipality/City'
            }),
            'status': forms.Select(attrs={
                'class': 'bg-gray-50 border-b-2 border-t-0 border-x-0 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-0 focus:border-b-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-b-primary-600',
            }),
            'description': forms.Textarea(attrs={
                'class': 'bg-gray-50 border-b-2 border-t-0 border-x-0 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-0 focus:border-b-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-b-primary-600',
                'placeholder': 'Write a description here'
            }),
            'life_history': forms.TextInput(attrs={
                'class': 'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500',
                'placeholder': 'Enter Life History'
            }),
            'weight': forms.TextInput(attrs={
                'class': 'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500',
                'placeholder': 'Enter Body Weight'
            }),
            'sex': forms.Select(attrs={
                'class': 'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500'
            }),
            'obl_rolled': forms.TextInput(attrs={
                'class': 'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500',
                'placeholder': 'Enter Overall Body Length'
            }),
            'obl_stretched': forms.TextInput(attrs={
                'class': 'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500',
                'placeholder': 'Enter Overall Body Length'
            }),
            'ticks': forms.Select(attrs={
                'class': 'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500'
            }),
            'feces': forms.Select(attrs={
                'class': 'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500'
            }),
        }



class IncidentReportForm(forms.ModelForm):

    date_reported = forms.DateField(
        widget=forms.DateInput(attrs={
            'type': 'date',  # 'date' input type triggers browser date picker
            'class': 'bg-gray-50 border-b-2 border-t-0 border-x-0 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-0 focus:border-b-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-b-primary-600',
            'placeholder': 'Select Date',
        })
    )
    evidence = forms.ImageField(
            widget=forms.FileInput(attrs={
                'class': 'hidden',
                'accept': 'image/*'
            }),
            required=False
    )


    class Meta:

        
        model = IncidentReport
        fields = "__all__"

        labels = {
            'municity': 'Municipality/City',
            'status': 'Status',
            'date_reported': 'Date Reported',
            'description': 'Description',
            'email': 'Email',
            'contact': 'Contact',
            'evidence': 'Evidence',
            'reporter': 'Full Name'
        }

        widgets = {
            'municity': forms.Select(attrs={
                'class': 'bg-gray-50 border-b-2 border-t-0 border-x-0 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-0 focus:border-b-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-b-primary-600',
                'placeholder': 'Enter Municipality/City'
            }),
            'status': forms.Select(attrs={
                'class': 'bg-gray-50 border-b-2 border-t-0 border-x-0 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-0 focus:border-b-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-b-primary-600',
            }),
            'description': forms.Textarea(attrs={
                'class': 'bg-gray-50 border-b-2 border-t-0 border-x-0 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-0 focus:border-b-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-b-primary-600',
                'placeholder': 'Write a description here'
            }),
            'email': forms.TextInput(attrs={
                'class': 'bg-gray-50 border-b-2 border-t-0 border-x-0 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-0 focus:border-b-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-b-primary-600',
                'placeholder': 'Enter Email Address'
            }),
            'contact': forms.TextInput(attrs={
                'class': 'bg-gray-50 border-b-2 border-t-0 border-x-0 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-0 focus:border-b-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-b-primary-600',
                'placeholder': 'Enter Contact Number'
            }),
             'reporter': forms.TextInput(attrs={
                'class': 'bg-gray-50 border-b-2 border-t-0 border-x-0 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-0 focus:border-b-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-b-primary-600',
                'placeholder': 'Enter Full Name'
            }),
            'evidence': forms.FileInput(attrs={
                'class': 'hidden',
                'accept': 'image/*'
            }),
        }
            
            
        


class OfficerForm(forms.ModelForm):

    date_joined = forms.DateField(
        widget=forms.DateInput(attrs={
            'type': 'date',  
            'class': 'bg-gray-50 border-b-2 border-t-0 border-x-0 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-0 focus:border-b-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-b-primary-600',
            'placeholder': 'Select Date',
        })
    )

    class Meta:

        officer_image = forms.ImageField(
            widget=forms.FileInput(attrs={
                'class': 'hidden',
                'accept': 'image/*'
            }),
        )
        model = Officer
        fields = "__all__"

        labels = {
            'first_name': 'First Name',
            'last_name': 'Last Name',
            'date_joined': 'Date Joined',
            'position': 'Position',
            'fb_url': 'Facebook Link',
            'ig_url': 'Instagram Link',
            'officer_image': 'Profile Image',
        }

        widgets = {
            'first_name': forms.TextInput(attrs={
                'class': 'bg-gray-50 border-b-2 border-t-0 border-x-0 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-0 focus:border-b-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-b-primary-600',
                'placeholder': 'Enter First Name'
            }),
            'last_name': forms.TextInput(attrs={
                'class': 'bg-gray-50 border-b-2 border-t-0 border-x-0 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-0 focus:border-b-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-b-primary-600',
                'placeholder': 'Enter Last Name'
            }),
            'position': forms.Select(choices=Officer.pos_choices, attrs={
                'class': 'bg-gray-50 border-b-2 border-t-0 border-x-0 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-0 focus:border-b-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-b-primary-600',
                'placeholder': 'Enter Position in the Organization'
            }),
            'fb_url': forms.URLInput(attrs={
                'class': 'bg-gray-50 border-b-2 border-t-0 border-x-0 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-0 focus:border-b-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-b-primary-600',
                'placeholder': 'Enter your full Facebook profile link (e.g., https://www.facebook.com/your.custom.url)',
                'required': 'required'
            }),
            'ig_url': forms.URLInput(attrs={
                'class': 'bg-gray-50 border-b-2 border-t-0 border-x-0 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-0 focus:border-b-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-b-primary-600',
                'placeholder': 'Enter your full Instagram profile link (e.g., https://www.instagram.com/your.custom.url)'
            }),
            'officer_image': forms.FileInput(attrs={
                'class': 'hidden',
                'accept': 'image/*'
            }),
        }

    def clean_fb_url(self):
        fb_url = self.cleaned_data.get('fb_url')
        if fb_url and not fb_url.startswith('https://'):
            raise ValidationError('The Facebook URL must start with https.')
        return fb_url

    def clean_ig_url(self):
        ig_url = self.cleaned_data.get('ig_url')
        if ig_url and not ig_url.startswith('https://'):
            raise ValidationError('The Instagram URL must start with https.')
        return ig_url


class GalleryForm(forms.ModelForm):

    media = forms.FileField(
        widget=forms.FileInput(attrs={
            'class': 'hidden',
            'accept': 'image/*,video/*'
        }),
    )
    class Meta:
        model = Gallery
        fields = ['uploader', 'media']

        labels = {
            'uploader': 'Uploader',
            'media': 'Media',
        }
        widgets = {
            'uploader': forms.TextInput(attrs={
                'class': 'bg-gray-50 border-b-2 border-t-0 border-x-0 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-0 focus:border-b-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-b-primary-600',
                'placeholder': 'Enter your name',
            }),
            'media': forms.FileInput(attrs={
                'class': 'hidden',
                'accept': 'image/*,video/*'
            }),
        }


class EventForm(forms.ModelForm):
    date = forms.DateField(
        widget=forms.DateInput(attrs={
            'type': 'date',
            'class': 'bg-gray-50 border-b-2 border-t-0 border-x-0 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-0 focus:border-b-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-b-primary-600',
            'placeholder': 'Select Date',
        })
    )
    event_image = forms.ImageField(
        widget=forms.FileInput(attrs={
            'class': 'hidden',
        }),
    )

    class Meta:
        model = Event
        fields = "__all__"

        labels = {
            'name': 'Name of Acitivity',
            'date': 'Date',
            'description': 'Description',
            'location': 'Location',
            'event_image': 'Image for the Activity'
        }

        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'bg-gray-50 border-b-2 border-t-0 border-x-0 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-0 focus:border-b-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-b-primary-600',
                'placeholder': 'Enter Activity Name'
            }),
            'description': forms.Textarea(attrs={
                'class': 'bg-gray-50 border-b-2 border-t-0 border-x-0 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-0 focus:border-b-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-b-primary-600',
                'placeholder': 'Enter Activity Description'
            }),
            'location': forms.TextInput(attrs={
                'class': 'bg-gray-50 border-b-2 border-t-0 border-x-0 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-0 focus:border-b-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-b-primary-600',
                'placeholder': 'Enter Activity Location'
            }),
            'event_image': forms.FileInput(attrs={
                'class': 'hidden',
                'accept': 'image/*'
            }),
        }


class UserForm(forms.ModelForm):

    class Meta:
        model = User
        fields = "__all__"

        labels = {
            'user_firstname': 'First Name',
            'user_lastname': 'Last Name',
            'user_email': 'Email',
            'contact': 'Contact Number',
            'password': 'Password',
        }

        widgets = {
            'user_firstname': forms.TextInput(attrs={
                'class': 'w-full px-4 border-b border-t-0 border-x-0 border-gray-400 text-gray-900 text-sm rounded-lg focus:ring-0 focus:border-b-primary-600 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-b-primary-600',
                'placeholder': 'Enter First Name'
            }),
            'user_lastname': forms.TextInput(attrs={
                'class': 'w-full px-4 border-b border-t-0 border-x-0 border-gray-400 text-gray-900 text-sm rounded-lg focus:ring-0 focus:border-b-primary-600 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-b-primary-600',
                'placeholder': 'Enter Last Name'
            }),
            'user_email': forms.TextInput(attrs={
                'class': 'w-full px-4 border-b border-t-0 border-x-0 border-gray-400 text-gray-900 text-sm rounded-lg focus:ring-0 focus:border-b-primary-600 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-b-primary-600',
                'placeholder': 'Enter your Email Address'
            }),

            'contact': forms.TextInput(attrs={
                'class': 'w-full px-4 border-b border-t-0 border-x-0 border-gray-400 text-gray-900 text-sm rounded-lg focus:ring-0 focus:border-b-primary-600 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-b-primary-600',
                'placeholder': 'Enter your contact number'
            }),

            'password': forms.TextInput(attrs={
                'class': 'w-full px-4 border-b border-t-0 border-x-0 border-gray-400 text-gray-900 text-sm rounded-lg focus:ring-0 focus:border-b-primary-600 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-b-primary-600',
                'placeholder': 'Use atleast 8 characters'
            }),
        }



class UserFormPrivate(forms.ModelForm):
    class Meta:
        model = User
        fields = ['user_firstname', 'user_lastname', 'user_email', 'contact']

        labels = {
            'user_firstname': 'First Name',
            'user_lastname': 'Last Name',
            'user_email': 'Email',
            'contact': 'Contact Number',
        }

        widgets = {
            'user_firstname': forms.TextInput(attrs={
                'class': 'w-full px-4 border-b border-t-0 border-x-0 border-gray-400 text-gray-900 text-sm rounded-lg focus:ring-0 focus:border-b-primary-600 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-b-primary-600',
                'placeholder': 'Enter First Name'
            }),
            'user_lastname': forms.TextInput(attrs={
                'class': 'w-full px-4 border-b border-t-0 border-x-0 border-gray-400 text-gray-900 text-sm rounded-lg focus:ring-0 focus:border-b-primary-600 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-b-primary-600',
                'placeholder': 'Enter Last Name'
            }),
            'user_email': forms.TextInput(attrs={
                'class': 'w-full px-4 border-b border-t-0 border-x-0 border-gray-400 text-gray-900 text-sm rounded-lg focus:ring-0 focus:border-b-primary-600 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-b-primary-600',
                'placeholder': 'Enter your Email Address'
            }),
            'contact': forms.TextInput(attrs={
                'class': 'w-full px-4 border-b border-t-0 border-x-0 border-gray-400 text-gray-900 text-sm rounded-lg focus:ring-0 focus:border-b-primary-600 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-b-primary-600',
                'placeholder': 'Enter your contact number'
            }),

            'password': forms.TextInput(attrs={
                'class': 'w-full px-4 border-b border-t-0 border-x-0 border-gray-400 text-gray-900 text-sm rounded-lg focus:ring-0 focus:border-b-primary-600 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-b-primary-600',
                'placeholder': 'Use atleast 8 characters'
            }),
        }


class ChangePasswordForm(forms.Form):
    current_password = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'class': 'w-full px-4 border-b border-t-0 border-x-0 border-gray-400 text-gray-900 text-sm rounded-lg focus:ring-0 focus:border-b-primary-600 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-b-primary-600',
            'placeholder': 'Enter Current Password'
        }),
        required=True
    )
    new_password = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'class': 'w-full px-4 border-b border-t-0 border-x-0 border-gray-400 text-gray-900 text-sm rounded-lg focus:ring-0 focus:border-b-primary-600 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-b-primary-600',
            'placeholder': 'Enter New Password'
        }),
        required=True,
        validators=[validate_password]
    )
    confirm_password = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'class': 'w-full px-4 border-b border-t-0 border-x-0 border-gray-400 text-gray-900 text-sm rounded-lg focus:ring-0 focus:border-b-primary-600 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-b-primary-600',
            'placeholder': 'Confirm New Password'
        }),
        required=True
    )

    def __init__(self, user, *args, **kwargs):
        self.user = user
        super().__init__(*args, **kwargs)

    def clean_current_password(self):
        current_password = self.cleaned_data['current_password']
        if not self.user.check_password(current_password):
            raise forms.ValidationError("Current password is incorrect.")
        return current_password

    def clean(self):
        cleaned_data = super().clean()
        new_password = cleaned_data.get("new_password")
        confirm_password = cleaned_data.get("confirm_password")

        if new_password and confirm_password:
            if new_password != confirm_password:
                self.add_error("confirm_password", "Passwords do not match.")
            
        return cleaned_data

    

class UserFormAdmin(forms.ModelForm):
    
    first_name = forms.CharField(
        widget=forms.TextInput(attrs={
            'class': 'w-full px-4 border-b border-t-0 border-x-0 border-gray-400 text-gray-900 text-sm rounded-lg focus:ring-0 focus:border-b-primary-600 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-b-primary-600',
            'placeholder': 'Enter First Name'
        })
    )
    last_name = forms.CharField(
        widget=forms.TextInput(attrs={
            'class': 'w-full px-4 border-b border-t-0 border-x-0 border-gray-400 text-gray-900 text-sm rounded-lg focus:ring-0 focus:border-b-primary-600 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-b-primary-600',
            'placeholder': 'Enter Last Name'
        })
    )
    email = forms.EmailField(
        widget=forms.EmailInput(attrs={
            'class': 'w-full px-4 border-b border-t-0 border-x-0 border-gray-400 text-gray-900 text-sm rounded-lg focus:ring-0 focus:border-b-primary-600 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-b-primary-600',
            'placeholder': 'Enter your Email Address'
        })
    )
    username = forms.CharField(
        widget=forms.TextInput(attrs={
            'class': 'w-full px-4 border-b border-t-0 border-x-0 border-gray-400 text-gray-900 text-sm rounded-lg focus:ring-0 focus:border-b-primary-600 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-b-primary-600',
            'placeholder': 'Enter your Username'
        })
    )

    class Meta:
        model = get_user_model()
        fields = ['first_name', 'last_name', 'email', 'username']
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance:
            
            for field in self.fields:
                self.fields[field].initial = getattr(self.instance, field, None)

    def save(self, commit=True):
        user = super().save(commit=False)
        user.first_name = self.cleaned_data['first_name']
        user.last_name = self.cleaned_data['last_name']
        user.username = self.cleaned_data['username']
        user.email = self.cleaned_data['email']
        
        if commit:
            user.save()
        return user

    def clean_email(self):
        email = self.cleaned_data.get('email')
        UserModel = get_user_model()
        
        if email:
            
            email_validator = EmailValidator()
            try:
                email_validator(email)
            except ValidationError:
                raise ValidationError("Enter a valid email address.")
                
            
            if UserModel.objects.filter(email=email).exclude(id=self.instance.id).exists():
                raise ValidationError('This email is already in use.')
                
        return email