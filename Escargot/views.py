from django.shortcuts import render, HttpResponseRedirect, redirect
from django.http import HttpResponse, JsonResponse
from django.template import Template, Context
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import logout
import json
from .models import CourseEscargot

def home(request):
    return render(request, 'home.html')
@login_required
def race(request):
    return render(request, 'race.html')

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
        course = CourseEscargot.objects.create(
            user=request.user,
            tickspeed=tickspeed,
            steps=steps,
            escargots=escargots,
            chances=chances
        )
        return JsonResponse({'success': True})
    else:
        return JsonResponse({'error': 'Une erreur s\'est produite.'})