import mimetypes
from django.db import models
from django.core.exceptions import ValidationError
from .utils import *
import os


def validate_file_type(value):

    ext = os.path.splitext(value.name)[1].lower()

    valid_image_extensions = ['.jpg', '.jpeg', '.png', '.gif']
    valid_video_extensions = ['.mp4', '.mov', '.avi', '.mkv']

    if ext not in valid_image_extensions and ext not in valid_video_extensions:
        raise ValidationError(
            'Unsupported file type. Upload an image or video.')


def validate_contact(value):
    value_str = str(value)
    if len(value_str) != 11 or not value_str.startswith('09'):
        raise ValidationError(
            'Contact number must be exactly 11 digits and start with 09.')


class BaseModel(models. Model):
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Incident(BaseModel):
    st_choices = (
        ('Alive', 'Alive'),
        ('Dead', 'Dead'),
        ('Scales', 'Scales'),
        ('Illegal Trade', 'Illegal Trade'),
    )

    mun_choices = (
        ('Aborlan', 'Aborlan'),
        ('Agutaya', 'Agutaya'),
        ('Araceli', 'Araceli'),
        ('Balabac', 'Balabac'),
        ('Bataraza', 'Bataraza'),
        ('Brooke\'s Point', 'Brooke\'s Point'),
        ('Busuanga', 'Busuanga'),
        ('Cagayancillo', 'Cagayancillo'),
        ('Coron', 'Coron'),
        ('Culion', 'Culion'),
        ('Cuyo', 'Cuyo'),
        ('Dumaran', 'Dumaran'),
        ('El Nido', 'El Nido'),
        ('Kalayaan', 'Kalayaan'),
        ('Linapacan', 'Linapacan'),
        ('Magsaysay', 'Magsaysay'),
        ('Narra', 'Narra'),
        ('Puerto Princesa City', 'Puerto Princesa City'),
        ('Quezon', 'Quezon'),
        ('Rizal', 'Rizal'),
        ('Roxas', 'Roxas'),
        ('San Vicente', 'San Vicente'),
        ('Sofronio Española', 'Sofronio Española'),
        ('Taytay', 'Taytay'),

    )

    sex_choices = (
        ('Male', 'Male'),
        ('Female', 'Female'),
    )

    y_n = (
        ('Yes', 'Yes'),
        ('No', 'No'),
    )

    municity = models.CharField(
        max_length=150, choices=mun_choices)
    status = models.CharField(max_length=150, choices=st_choices)
    date_reported = models.DateField()
    description = models.CharField(max_length=250)
    life_history = models.CharField(max_length=250, blank=True, null=True)
    sex = models.CharField(max_length=150, choices=sex_choices, blank=True, null=True)
    weight = models.CharField(max_length=250, blank=True, null=True)
    obl_rolled = models.CharField(max_length=250, blank=True, null=True)
    obl_stretched = models.CharField(max_length=250, blank=True, null=True)
    ticks = models.CharField(max_length=150, choices=y_n, blank=True, null=True)
    feces = models.CharField(max_length=150, choices=y_n, blank=True, null=True)

    def __str__(self):

        return f"{self.municity} - {self.id} ({self.status})"


class Evidence(BaseModel):

    ev_choices = (
        ('Image', 'Image'),
        ('Video', 'Video'),
    )
    evidence_type = models.CharField(max_length=150, choices=ev_choices)
    incident = models.ForeignKey(Incident, on_delete=models.CASCADE)
    file = models.FileField(upload_to='media/', null=True,
                            blank=True, validators=[validate_file_type])

    def __str__(self):

        if self.file:
            return self.file.name  # Returns the relative file path
        return "No file uploaded"


class Admin(BaseModel):
    username = models.CharField(max_length=250)
    password = models.CharField(max_length=500)
    email = models.CharField(max_length=150)

    def __str__(self):
        return self.username


class IncidentReport(BaseModel):

    st_choices = (
        ('Alive', 'Alive'),
        ('Dead', 'Dead'),
        ('Scales', 'Scales'),
        ('Illegal Trade', 'Illegal Trade'),
    )

    mun_choices = (
        ('Aborlan', 'Aborlan'),
        ('Agutaya', 'Agutaya'),
        ('Araceli', 'Araceli'),
        ('Balabac', 'Balabac'),
        ('Bataraza', 'Bataraza'),
        ('Brooke\'s Point', 'Brooke\'s Point'),
        ('Busuanga', 'Busuanga'),
        ('Cagayancillo', 'Cagayancillo'),
        ('Coron', 'Coron'),
        ('Culion', 'Culion'),
        ('Cuyo', 'Cuyo'),
        ('Dumaran', 'Dumaran'),
        ('El Nido', 'El Nido'),
        ('Kalayaan', 'Kalayaan'),
        ('Linapacan', 'Linapacan'),
        ('Magsaysay', 'Magsaysay'),
        ('Narra', 'Narra'),
        ('Puerto Princesa City', 'Puerto Princesa City'),
        ('Quezon', 'Quezon'),
        ('Rizal', 'Rizal'),
        ('Roxas', 'Roxas'),
        ('San Vicente', 'San Vicente'),
        ('Sofronio Española', 'Sofronio Española'),
        ('Taytay', 'Taytay'),

    )



    municity = models.CharField(
        max_length=150, choices=mun_choices)
    status = models.CharField(max_length=150, choices=st_choices)
    date_reported = models.DateField()
    description = models.CharField(max_length=250)
    

    def __str__(self):

        return f"{self.municity} - {self.id} ({self.status})"

class Officer(BaseModel):
    pos_choices = [
        ('President', 'President'),
        ('Vice President', 'Vice President'),
        ('Secretary', 'Secretary'),
        ('Treasurer', 'Treasurer'),
        ('Auditor', 'Auditor'),
        ('Pio Internal', 'Pio Internal'),
        ('Pio External', 'Pio External'),
        ('Business Manager', 'Business Manager'),
    ]

    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    date_joined = models.DateField()
    position = models.CharField(max_length=150, choices=pos_choices)
    fb_url = models.CharField(max_length=150, null=True, blank=True)
    ig_url = models.CharField(max_length=150, null=True, blank=True)
    officer_image = models.ImageField(
        upload_to='officers/', null=True, blank=True
    )

    def save(self, *args, **kwargs):
        if self.pk:
            delete_old_file(self, self.officer_image, 'officer_image')

        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        delete_file(self.officer_image)
        super().delete(*args, **kwargs)

    def __str__(self):
        return f"{self.last_name}, {self.first_name} ({self.position})"


class Event(BaseModel):
    name = models.CharField(max_length=150)
    description = models.CharField(max_length=150)
    date = models.DateField()
    location = models.CharField(max_length=150)
    event_image = models.ImageField(
        upload_to='activities/', null=True, blank=True
    )

    def save(self, *args, **kwargs):
        if self.pk:
            delete_old_file(self, self.event_image, 'event_image')

        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        delete_file(self.event_image)
        super().delete(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.date})"


class User(BaseModel):
    user_firstname = models.CharField(max_length=150)
    user_lastname = models.CharField(max_length=150)
    user_email = models.EmailField(max_length=150)
    password = models.CharField(max_length=150)
    contact = models.CharField(max_length=11, validators=[validate_contact])

    def __str__(self):
        return f"{self.user_firstname} - {self.user_email}"


class Gallery(BaseModel):
    gal_choices = (
        ('Image', 'Image'),
        ('Video', 'Video'),
    )
    uploader = models.CharField(max_length=150)
    media_type = models.CharField(
        max_length=150, blank=True, choices=gal_choices
    )
    media = models.FileField(
        upload_to='gallery/', null=True, blank=False, validators=[validate_file_type]
    )

    def save(self, *args, **kwargs):
        if self.pk:
            # Delete the old file if a new file is uploaded
            delete_old_file(self, self.media, 'media')

        # Set media_type based on MIME type
        if self.media:
            mime_type, encoding = mimetypes.guess_type(self.media.name)
            if mime_type:
                if mime_type.startswith('image/'):
                    self.media_type = 'Image'
                elif mime_type.startswith('video/'):
                    self.media_type = 'Video'
                else:
                    raise ValidationError("Unsupported file type")

        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        delete_file(self.media)
        super().delete(*args, **kwargs)

    def __str__(self):
        return f"{self.uploader} - {self.media}"
