from django.db import models
from django.contrib.auth.models import User

class CourseEscargot(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    tickspeed = models.IntegerField()
    steps = models.IntegerField()
    escargots = models.IntegerField()
    chances = models.IntegerField()
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"CourseEscargot #{self.id} - Utilisateur: {self.user.username}"

