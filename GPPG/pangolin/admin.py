from django.contrib import admin
from .models import *


@admin.register(Incident)
class IncidentAdmin(admin.ModelAdmin):
    list_display = ("municity", "status", "description")
    search_fields = ("municity", "status")


@admin.register(Evidence)
class EvidenceAdmin(admin.ModelAdmin):
    list_display = ("incident", "evidence_type", "file")
    search_fields = ("incident", "evidence_type")


@admin.register(IncidentReport)
class IncidentReportAdmin(admin.ModelAdmin):
    list_display = ("municity", "status", "description")
    search_fields = ("municity", "status")



@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("name", "date", "description")
    search_fields = ("name", "date", "description")


@admin.register(Gallery)
class GalleryAdmin(admin.ModelAdmin):
    list_display = ("uploader", "created_at", "media_type", "media")
    search_fields = ("uploader", "created_at", "media_type", "media")


@admin.register(Officer)
class OfficerAdmin(admin.ModelAdmin):
    list_display = ("last_name", "first_name", "date_joined",
                    "position", "officer_image")
    search_fields = ("last_name", "first_name", "date_joined",
                     "position", "officer_image")


admin.site.register(Admin)
admin.site.register(User)
