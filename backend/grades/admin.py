from django.contrib import admin
from .models import Grade

@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ('submission', 'score', 'graded_at')
    list_filter = ('graded_at',)
    search_fields = ('submission__student__username',)