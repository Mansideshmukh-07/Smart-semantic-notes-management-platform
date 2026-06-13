from django.urls import path
from .views import (
    SignupView, 
    ProfileView, 
    FileUploadAndProcessView, 
    ChatQueryView # 1. IMPORT YOUR NEW VIEW CLASS HERE!
)

urlpatterns = [
    path('signup/', SignupView.as_view()),
    path('profile/', ProfileView.as_view()),
    
    # Appended our modular cleaning/chunking file pipeline right below:
    path('files/upload/', FileUploadAndProcessView.as_view()),
    
    # 2. ADD THIS EXACT PATH ROUTE TO STOP THE 404 ERROR!
    path('chat/query/', ChatQueryView.as_view()),
]


"""from django.urls import path
from .views import SignupView, ProfileView, FileUploadAndProcessView
urlpatterns = [
    path('signup/', SignupView.as_view()),
    path('profile/', ProfileView.as_view()),
    #Appended our modular cleaning/chunking file pipeline right below:
    path('files/upload/', FileUploadAndProcessView.as_view()),
]"""


