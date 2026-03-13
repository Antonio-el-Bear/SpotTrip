from django.urls import path
from .views import UserListView, UserRegisterView

urlpatterns = [
    path('users/', UserListView.as_view(), name='user-list'),
    path('register/', UserRegisterView.as_view(), name='user-register'),
]
