from django.shortcuts import render, HttpResponseRedirect
from django.http import HttpResponse
from django.template import Template, Context

def home(request):
    return render(request, 'home.html')

def race(request):
    return render(request, 'race.html')
