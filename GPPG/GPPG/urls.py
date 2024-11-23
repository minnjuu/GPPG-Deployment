from django.contrib import admin
from django.contrib.auth import views as auth_views
from django.views.generic import TemplateView
from django.urls import path, include
from pangolin import views
from pangolin.views import *
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path('admin/', admin.site.urls),

    path('', views.landing_page, name='landing_page'),

    path('signup/', views.signup, name='signup'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),

    path('chat/send_message/', views.send_message, name='send_message'),

    path('about./', views.public_about, name='public_about'),
    path('officers./', views.public_officers, name='public_officers'),
    path('home/', views.home, name='home'),


    path('accounts/', include('allauth.urls')),
    path('auth/google/callback/', views.google_login_callback,
         name='google_login_callback'),

    path('api/palawan-data/', views.get_geojson, name='palawan_data'),
    path('verify-otp/', views.verify_otp, name='verify_otp'),
    path('resend-otp/', views.resend_otp, name='resend_otp'),

    path('gallery/', views.gallery, name='gallery'),
    path('gallery_video/', views.gallery_video, name='gallery_video'),
    path('about/', views.about, name='about'),
    path('activities/', views.activities, name='activities'),
    path('trend/', views.trend, name='trend'),
    path('officers/', views.officers, name='officers'),
    path('maps/', views.maps, name='maps'),
    path('account_view/', views.account_view, name='account_view'),
    path('change_password/', views.change_password, name='change_password'),
    path('account_view/<int:id>/edit', views.user_update_private,
         name='private_userAccounts_edit'),
    # ADMIN
    path('admin_home/', views.admin_home, name='admin_home'),
    path('admin_login/', views.admin_login, name='admin_login'),
    path('admin_logout/', views.admin_logout, name='admin_logout'),
    path('admin_profile/', AdminLogView.as_view(), name='admin_profile'),
    path('activities_database/', EventListView.as_view(),
         name='admin_activities_database'),
    path('activities_database/add', views.activity_add,
         name='admin_activities_add'),
    path('activities_database/<int:id>',
         views.activity_update, name='admin_activities_edit'),
    path('activities_database/<int:id>/delete',
         views.activity_delete, name='admin_activities_delete'),
    path('incidents/', IncidentListView.as_view(),
         name='admin_incident_database'),
    path('incidents/add', views.incident_add, name='admin_incident_add'),
    path('incidents/<int:id>/', views.incident_update, name='admin_incident_edit'),
    path('incidents/<int:id>/delete', views.incident_delete,
         name='admin_incident_delete'),
    path('useraccounts/', UserListView.as_view(),
         name='admin_userAccounts_database'),
    path('useraccounts/add', views.user_add, name='admin_userAccounts_add'),
    path('useraccounts/<int:id>', views.user_update,
         name='admin_userAccounts_edit'),
    path('useraccounts/<int:id>/delete', views.user_delete,
         name='admin_userAccounts_delete'),
    path('databasegallery/', GalleryListView.as_view(),
         name='admin_gallery_database'),
    path('databasegallery/add', views.gallery_add, name='admin_gallery_add'),
    path('databasegallery/<int:id>',
         views.gallery_update, name='admin_gallery_edit'),
    path('databasegallery/<int:id>/delete',
         views.gallery_delete, name='admin_gallery_delete'),
    path('officers_database/', OfficerListView.as_view(),
         name='admin_officers_database'),
    path('officers_database/add', views.officer_add, name='admin_officers_add'),
    path('officers_database/<int:id>/',
         views.officer_update, name='admin_officers_edit'),
    path('officers_database/<int:id>/delete',
         views.officer_delete, name='admin_officers_delete'),
    path('admin_officers/', views.admin_officers, name='admin_officers'),
    path('admin_charts/', views.admin_charts, name='admin_charts'),
    path('admin_map/', views.admin_map, name='admin_map'),
    path('admin_report/', IncidentReportsListView.as_view(), name='admin_report'),
    path("confirm_accept/<int:report_id>/", views.confirm_accept, name="confirm-accept"),
    path("accept-incident/<int:report_id>/", views.accept_incident, name="accept-incident"),
    path("confirm_cancel/<int:report_id>/", views.confirm_cancel, name="confirm-cancel"),
    path("cancel-incident/<int:report_id>/", views.cancel_incident, name="cancel-incident"),
    path('get-poaching-trends/', views.get_poaching_trends,
         name='get_poaching_trends'),
    path('get-chart-data/', views.get_chart_data,
         name='get_chart_data'),
    path('get-registereduser-data/', views.get_registereduser_data,
         name='get_registereduser_data'),
    path('get-available-years/', views.get_available_years,
         name='get_available_years'),
    path('get-region-data/', views.get_region_data,
         name='get_region_data'),
    path('get-municity-data/', views.get_municity_data,
         name='get_municity_data'),

    path('password-reset/', PasswordResetView.as_view(), name='password_reset'),
    path('reset/<uidb64>/<token>/', PasswordResetConfirmView.as_view(),
         name='password_reset_confirm'),


] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
