# Create your views here.
from collections import defaultdict
from datetime import datetime
from django.core.serializers import json
from django.http import HttpResponse
from Dining.constants import LUNCH
from Dining.models import Dish
from django.shortcuts import render_to_response

def home(request):
    return render_to_response('home.html')


def menus(request):
    today = datetime.today()
    meal = LUNCH
    dishes = Dish.objects.filter(date=today, meal=meal)
    meals = defaultdict(lambda: [])
    for dish in dishes:
        meals[dish.place].append(dish.food.name)
    rtn = {
        'menus': meals.items()
    }
    return HttpResponse(json.simplejson.dumps(rtn), mimetype="application/json")
