from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from .models import Grade
from .serializers import GradeSerializer


class GradeViewSet(viewsets.ModelViewSet):
    serializer_class = GradeSerializer

    def get_queryset(self):
        queryset = Grade.objects.all()
        user = self.request.user
        if not user.is_authenticated:
            return Grade.objects.none()

        profile = getattr(user, 'userprofile', None)
        is_teacher = profile and profile.role in ('teacher', 'admin')

        if self.request.query_params.get('mine') == 'true':
            queryset = queryset.filter(submission__student=user)
        elif not is_teacher:
            # студент без ?mine=true видит только свои оценки в любом случае
            queryset = queryset.filter(submission__student=user)

        course_id = self.request.query_params.get('course')
        if course_id:
            queryset = queryset.filter(submission__assignment__course_id=course_id)

        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        profile = getattr(user, 'userprofile', None)
        if not user.is_authenticated or not profile or profile.role not in ('teacher', 'admin'):
            raise PermissionDenied("Только учителя могут выставлять оценки")
        serializer.save()