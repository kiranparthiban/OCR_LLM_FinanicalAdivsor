from django.urls import path
from .views import AnalyseView

app_name = "ai"

urlpatterns = [
    path("analyse/", AnalyseView.as_view(), name="analyse"),
]
