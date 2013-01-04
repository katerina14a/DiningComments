from django.contrib.auth.models import User
from django.contrib.auth import login, authenticate, logout
from django.views.decorators.csrf import ensure_csrf_cookie
from datetime import date, timedelta
from django.core.serializers import json
from django.http import HttpResponse
from Dining.models import Meal
from django.shortcuts import render_to_response
from django.core.validators import email_re

@ensure_csrf_cookie
def home(request):
    variables = {}
    if request.user.is_authenticated():
        variables['username'] = request.user.username
    return render_to_response('home.html', variables)

def menus(request):

    one_day = timedelta(days=1)
    def get_next_meal(menu_date, menu_meal):
        if menu_meal == 'Breakfast':
            next_meal = 'Lunch'
            next_date = menu_date
        if menu_meal == 'Lunch':
            next_meal = 'Dinner'
            next_date = menu_date
        if menu_meal == 'Dinner':
            next_meal = 'Breakfast'
            next_date = menu_date + one_day
        return next_meal,next_date

    def get_prev_meal(menu_date, menu_meal):
        if menu_meal == 'Breakfast':
            prev_meal = 'Dinner'
            prev_date = menu_date - one_day
        if menu_meal == 'Lunch':
            prev_meal = 'Breakfast'
            prev_date = menu_date
        if menu_meal == 'Dinner':
            prev_meal = 'Lunch'
            prev_date = menu_date
        return prev_meal,prev_date
    

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
    next_meal,next_date = get_next_meal(menu_date,menu_meal)
    prev_meal,prev_date = get_prev_meal(menu_date,menu_meal)
    # Getting next/prev menus that have food
    while Meal.empty_meal(next_meal,next_date) and next_date - timedelta(days=4) <= date.today():
        next_meal,next_date = get_next_meal(next_date,next_meal)
    while Meal.empty_meal(prev_meal,prev_date) and prev_date >= date(2012,10,14):
        prev_meal,prev_date = get_prev_meal(prev_date,prev_meal)

    next_id = '%s %s' % (next_date.isoformat(), next_meal)
    prev_id = '%s %s' % (prev_date.isoformat(), prev_meal)

    # Hardcode first meal ever and last predicted meal
    if next_date - timedelta(days=4) > date.today():
        next_id = 'stop'
    elif prev_date < date(2012,10,14):
        prev_id = 'stop'
    title, menus = Meal.getMenus(menu_date, menu_meal)
    rtn = {
        'title': title,
        'menus': menus,
        'prev': prev_id,
        'next': next_id,
        }
    return HttpResponse(json.simplejson.dumps(rtn), mimetype="application/json")


def register(request):
    username = request.POST['username']
    password = request.POST['password']
    email = request.POST['email']
    # Check to make sure stuffs is valid
    errors = {}
    if not email_re.match(email):
        errors['email'] = "Invalid email format."
    else:
        try:
            User.objects.get(email=email)
            errors['email'] = "Email is already taken."
        except User.DoesNotExist:
            pass
    try:
        User.objects.get(username=username)
        errors['username'] = "Username is already taken."
    except User.DoesNotExist:
        pass

    if errors:
        return HttpResponse(json.simplejson.dumps(errors), mimetype="application/json")
    User.objects.create_user(username, email, password)
    return login_user(request)


def login_user(request):
    username = request.POST['username']
    password = request.POST['password']
    if not request.POST.get('remember', None):
        request.session.set_expiry(0)
    user = authenticate(username=username, password=password)
    # Check authentication worked
    login(request, user)
    return HttpResponse("ok", mimetype="text/plain")


def logout_user(request):
    logout(request)
    return HttpResponse("ok", mimetype="text/plain")