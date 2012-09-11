# -*- coding: utf-8 -*-

from urllib2 import urlopen
from urllib import url2pathname
from time import localtime
import re, datetime
from Dining.constants import (
    CROSSROADS,
    CAFE_3,
    FOOTHILL,
    CLARK_KERR,
    BREAKFAST,
    BRUNCH,
    LUNCH,
    DINNER,
    CARNIVORE,
    VEGETARIAN,
    VEGAN,
)
from Dining.models import Food, Dish

locations = {
    CROSSROADS  : ["01", "CROSSROADS'"],
    CAFE_3      : ["03", "CAFE"],
    FOOTHILL    : ["06", "FOOTHILL'"],
    CLARK_KERR  : ["04", "CLARK"],
}

color_to_type = {
    '800040': VEGAN,
    '008000': VEGETARIAN,
    #'008040': "Vegetarian",
    '000080': VEGETARIAN,
    '0000A0': VEGETARIAN,
    '000000': CARNIVORE,
}

def get_url(location, date):
    """Returns a URL (string) for the menu of the DC on the specified date"""

    url_template = 'http://services.housing.berkeley.edu/FoodPro/dining/static/DiningMenus.asp?dtCurDate=%s&strCurLocation=%s&strCurLocationName=%s'
    url_args = [date] + locations[location]
    return url_template % tuple(url_args)

def get_dates():
    """Returns a list of dates (strings) for which menues are currently offered"""

    current_time = localtime()
    todays_date = str(current_time[1]) + "/" + str(current_time[2]) + "/" + str(current_time[0])
    url = get_url(CROSSROADS, todays_date)
    f = urlopen(url)
    data = f.read()
    f.close()

    ## match: rDate=<chars>&st (Match Least) slice[6:-3]
    date_list = re.findall('rDate=.{7,15}&st', data)
    for i in range(len(date_list)):
        date_list[i] = date_list[i][6:-3]
    return map(url2pathname, date_list)

def get_dishes():
    print "Retrieving Menus..."
    dishes = []
    for date in get_dates():
        for location in locations.iterkeys():
            url = get_url(location, date)
            f = urlopen(url)
            data = f.read()
            f.close()
            meals_search = re.compile("<td>\n.*?</td>", re.DOTALL)
            meals_html = meals_search.findall(data)
            for meal, meal_html in enumerate(meals_html):
                for food_html in meal_html.split("</font></b></a>")[1:]:
                    food_data = food_html.split("•<font color=#")[-1]
                    try:
                        color, name = food_data.split(">")
                        dietary = color_to_type.get(color, CARNIVORE)
                        dishes.append((date, convert_meal(meals_html, meal), location, name, dietary))
                    except ValueError:
                        print food_data
                        pass

    print "Done."
    return dishes

def convert_meal(meals, meal):
    convert_dict = {3: {0: BREAKFAST, 1: LUNCH, 2: DINNER,},
                    2: {0: BRUNCH, 1: DINNER,},
                    1: {0: DINNER,}
    }
    return convert_dict[len(meals)][meal]

def create_date_obj(date_str):
    date_parts = date_str.split("/")
    if len(date_parts) == 1:
        date_parts = date_str.split(".")
    if len(date_parts[2]) == 2:
        date_parts[2] = "20" + date_parts[2]
    date_parts = map(lambda x: int(x), date_parts)
    return datetime.date(date_parts[2], date_parts[0], date_parts[1])

def sync():
    for dish in get_dishes():
        add_dish(dish)

def add_dish(dish):
    print "ADDING"
    date, meal, location, name, dietary = dish
    date = create_date_obj(date)
    try:
        food_object = Food.objects.get(name=name)
    except Food.DoesNotExist:
        food_object = Food(name=name, dietary_restrictions=dietary)
        food_object.save()

    try:
        Dish.objects.get(date=date, meal=meal, place=location, food=food_object)
    except Dish.DoesNotExist:
        Dish(date=date, meal=meal, place=location, food=food_object).save()
