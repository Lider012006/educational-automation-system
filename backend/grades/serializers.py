from rest_framework import serializers
from .models import Grade


class GradeSerializer(serializers.ModelSerializer):
    student_username = serializers.CharField(source='submission.student.username', read_only=True)
    assignment_title = serializers.CharField(source='submission.assignment.title', read_only=True)
    course_title = serializers.CharField(source='submission.assignment.course.title', read_only=True)
    course_id = serializers.IntegerField(source='submission.assignment.course.id', read_only=True)

    class Meta:
        model = Grade
        fields = [
            'id', 'submission', 'score', 'feedback', 'graded_at',
            'student_username', 'assignment_title', 'course_title', 'course_id',
        ]