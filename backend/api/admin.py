from django.contrib import admin
from .models import Challenge, TestCase, Attempt, UserMetrics

admin.site.register(Challenge)
admin.site.register(TestCase)
admin.site.register(Attempt)
admin.site.register(UserMetrics)