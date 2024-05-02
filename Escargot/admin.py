from django.contrib import admin
from Escargot.models import CourseEscargot, Player

@admin.register(CourseEscargot)
class EscargotAdmin(admin.ModelAdmin):
    list_display = ('user',"ref", 'tickspeed', 'steps', 'escargots', 'chances', 'date_created')

@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    list_display = ('name', "race_ref",'bet','date_played')