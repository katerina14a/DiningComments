# Create your views here.
from collections import defaultdict
from datetime import date, timedelta
from django.core.serializers import json
from django.http import HttpResponse
from Dining.constants import int_to_dc, meal_to_int
from Dining.models import Dish
from django.shortcuts import render_to_response

def home(request):
    return render_to_response('home.html')


def menus(request):
    one_day = timedelta(days=1)
    if 'menu_id' in request.GET:
        menu_id = request.GET['menu_id']
        # Parse to python objects
        string_date, menu_meal = menu_id.split(' ')
        year, month, day = map(int, string_date.split('-'))
        menu_date = date(year, month, day)
    else:
        # Just create default python objects
        menu_date = date.today()
        menu_meal = 'Lunch'

    if menu_meal == 'Breakfast':
        next_meal = 'Lunch'
        next_date = menu_date
        prev_meal = 'Dinner'
        prev_date = menu_date - one_day
    if menu_meal == 'Lunch':
        next_meal = 'Dinner'
        next_date = menu_date
        prev_meal = 'Breakfast'
        prev_date = menu_date
    if menu_meal == 'Dinner':
        next_meal = 'Breakfast'
        next_date = menu_date + one_day
        prev_meal = 'Lunch'
        prev_date = menu_date
    next_id = '%s %s' % (next_date.isoformat(), next_meal)
    prev_id = '%s %s' % (prev_date.isoformat(), prev_meal)
    meal = meal_to_int[menu_meal]
    dishes = Dish.objects.filter(date=menu_date, meal=meal)
    meals = defaultdict(lambda: [])
    for dish in dishes:
        meals[int_to_dc[dish.place]].append(dish.food.name)
    rtn = {
        'menus': meals.items(),
        'prev': prev_id,
        'next': next_id,
        }
    return HttpResponse(json.simplejson.dumps(rtn), mimetype="application/json")
