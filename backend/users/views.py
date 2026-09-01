from django.shortcuts import render
from rest_framework import viewsets
from django.contrib.auth.models import User
from rest_framework.serializers import ModelSerializer

class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
