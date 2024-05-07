from django.urls import path, include
from . import views
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('', views.race, name='home'),
    path('race', views.race, name='race'),
    path('history', views.history, name='history'),
    path('accounts/', include('django.contrib.auth.urls')),
    path("signup/", views.authView, name="authView"),
    path("logout/", views.logoutCustom, name="logout"),
    path("login/", views.loginCustom, name="login"),
    path('enregistrer_course/', views.enregistrer_course, name="enregistrer_course"),
    path('enregistrer_joueur/', views.enregistrer_joueur, name="enregistrer_joueur"),
]