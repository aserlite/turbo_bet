from django.contrib import admin
from Escargot.models import CourseEscargot

@admin.register(CourseEscargot)
class EscargotAdmin(admin.ModelAdmin):
    list_display = ('user', 'tickspeed', 'steps', 'escargots', 'chances', 'date_created')