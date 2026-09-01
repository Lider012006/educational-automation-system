from django.db import models
from django.contrib.auth.models import User
from assignments.models import Submission

class Grade(models.Model):
    """Модель оценки"""
    submission = models.OneToOneField(Submission, on_delete=models.CASCADE)
    score = models.IntegerField()  # 0-100
    feedback = models.TextField(blank=True)
    graded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.submission.student.username} - {self.score}"