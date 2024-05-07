from django.shortcuts import render, HttpResponseRedirect, redirect
from django.http import HttpResponse, JsonResponse
from django.template import Template, Context
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import logout
import json
from .models import CourseEscargot, Player

def home(request):
    return render(request, 'home.html')
@login_required
def race(request):
    return render(request, 'race.html')


@login_required
def history(request):
    courses = CourseEscargot.objects.filter(user=request.user).order_by('-date_created')
    history_data = []
    for course in courses:
        players = Player.objects.filter(race_ref=course.ref)
        course.date = course.date_created.strftime("%d %b %Y, %H:%M:%S")
        player_data = [{'name': player.name, 'bet': player.bet} for player in players]
        history_data.append({'course': course, 'players': player_data})
    return render(request, 'history.html', {'history_data': history_data})
def authView(request):
 if request.method == "POST":
  form = UserCreationForm(request.POST or None)
  if form.is_valid():
   form.save()
   return redirect("/accounts/login")
 else:
  form = UserCreationForm()
 return render(request, "registration/signup.html", {"form": form})

@login_required
def logoutCustom(request):
    logout(request);
    return redirect("/")

def loginCustom(request):
    return redirect("/accounts/login")

def enregistrer_course(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        tickspeed = data.get('tickspeed')
        steps = data.get('steps')
        escargots = data.get('escargots')
        chances = data.get('chances')
        ref = data.get('ref')
        participants = data.get('participants')
        winner = data.get('winner')
        course = CourseEscargot.objects.create(
            user=request.user,
            ref=ref,
            tickspeed=tickspeed,
            steps=steps,
            escargots=escargots,
            chances=chances,
            participants=participants,
            winner=winner,
        )
        return JsonResponse({'success': True})
    else:
        return JsonResponse({'error': 'Une erreur s\'est produite.'})

def enregistrer_joueur(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        name = data.get('name')
        bet = data.get('bet')
        race_ref = data.get('race_ref')
        joueur = Player.objects.create(
            user=request.user,
            name=name,
            bet=bet,
            race_ref=race_ref,
        )
        return JsonResponse({'success': True})
    else:
        return JsonResponse({'error': 'Une erreur s\'est produite.'})