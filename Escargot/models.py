from django.db import models
from django.contrib.auth.models import User

class CourseEscargot(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    ref = models.IntegerField()
    tickspeed = models.IntegerField()
    steps = models.IntegerField()
    escargots = models.IntegerField()
    chances = models.IntegerField()
    participants = models.IntegerField()
    winner = models.IntegerField()
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"CourseEscargot #{self.id} - Utilisateur: {self.user.username}"

class Player(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    race_ref = models.IntegerField()
    name = models.TextField()
    bet = models.IntegerField()
    date_played = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Le joueur {self.name} a parié sur escargot : {self.bet}"