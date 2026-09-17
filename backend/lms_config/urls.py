from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from django.templatetags.static import static

urlpatterns = [
    path('favicon.ico', RedirectView.as_view(url=static('favicon.ico'))),
    path('admin/', admin.site.urls),
    path('api/', include('courses.urls')),
    path('api/users/', include('users.urls')),
    path('api/', include('assignments.urls')),
    path('api/', include('grades.urls')),
]