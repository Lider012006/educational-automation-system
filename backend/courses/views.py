from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from .models import Course, Lesson
from .serializers import CourseSerializer, LessonSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

    def perform_create(self, serializer):
        user = self.request.user
        if not user.is_authenticated:
            raise PermissionDenied("Нужно войти в систему")
        profile = getattr(user, 'userprofile', None)
        if not profile or profile.role not in ('teacher', 'admin'):
            raise PermissionDenied("Только учителя могут создавать курсы")
        serializer.save(teacher=user)


class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer