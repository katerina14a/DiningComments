# coding=utf-8
from collections import defaultdict
import datetime
from django.db import models
from constants import (
    OMNIVORE,
    VEGETARIAN,
    VEGAN,
    BREAKFAST,
    BRUNCH,
    LUNCH,
    DINNER,
    CROSSROADS,
    CAFE_3,
    FOOTHILL,
    CLARK_KERR,
    meal_to_int,
    int_to_dc,
    FOOD_LIST_DELIMITER)

dietary_restrictions_choices = (
    (OMNIVORE, 'Carnivore'),
    (VEGETARIAN, 'Vegetarian'),
    (VEGAN, 'Vegan'),
)

meal_choices = (
    (BREAKFAST, 'Breakfast'),
    (BRUNCH, 'Brunch'),
    (LUNCH, 'Lunch'),
    (DINNER, 'Dinner'),
)

place_choices = (
    (CROSSROADS, 'Crossroads'),
    (CAFE_3, 'Cafe 3'),
    (FOOTHILL, 'Foothill'),
    (CLARK_KERR, 'Clark Kerr'),
)

class Food(models.Model):
    name = models.CharField(max_length=100)
    dietary_restrictions = models.IntegerField(choices=dietary_restrictions_choices)

    def __unicode__(self):
        return self.name

class Meal(models.Model):
    date = models.DateField()
    name = models.IntegerField(choices=meal_choices)
    place = models.IntegerField(choices=place_choices)
    food_ids = models.TextField()

    def __unicode__(self):
        return "%s at %s on %s" % (self.name, self.place, self.date)

    @classmethod
    def empty_meal(cls,meal,date):
        meals = Meal.objects.filter(date=date, name=meal_to_int[meal])
        if meals.exists():
            return False
        elif meal == 'Lunch':
            meals = Meal.objects.filter(date=date, name=BRUNCH)
            if meals.exists():
                return False
        return True


    @classmethod
    def format_date(cls, date):
        today = datetime.date.today()
        one_day = datetime.timedelta(days=1)
        yesterday = today - one_day
        tomorrow = today + one_day
        if date == yesterday:
            return "Yesterday"
        elif date == today:
            return "Today"
        elif date == tomorrow:
            return "Tomorrow"
        else:
            return date.strftime('%A %b %d').replace(' 0', ' ')

    @classmethod
    def getMenus(cls, date, meal):
        meal_int = meal_to_int[meal]
        meals = Meal.objects.filter(date=date, name=meal_int)
        if meal_int == LUNCH:
            extra_meals = Meal.objects.filter(date=date, name=BRUNCH)
            if meals and extra_meals:
                meal = "Lunch/Brunch"
            elif meals:
                meal = "Lunch"
            elif extra_meals:
                meal = "Brunch"
            meals = meals | extra_meals
        date = Meal.format_date(date)
        title = "%s - %s" % (date, meal)

        menus = []
        for m in meals:
            food_ids = m.food_ids.split(FOOD_LIST_DELIMITER)
            food_dict = defaultdict(lambda: [])
            for food_id in food_ids:
                name = Food.objects.get(id=int(food_id)).name
                name_lower = name.lower()
                if "pizza" in name_lower:
                    food_dict["Pizza"].append(name)
                elif "soup" in name_lower or "chowder" in name_lower or "bisque" in name_lower or "chili" in name_lower or "oatmeal" in name_lower:
                    food_dict["Soup"].append(name)
                elif "HB" == name[:2]:
                    food_dict["Dessert"].append(name[3:])
                elif "cookie" in name_lower or "yogurt" in name_lower or "sorbet" in name_lower or "tart" in name_lower or "choc" in name_lower:
                    food_dict["Dessert"].append(name)
                elif "salad" in name_lower or "Sld" in name:
                    food_dict["Salad"].append(name)
                else:
                    food_dict["Entrée"].append(name)

            keys = ["Entrée","Pizza","Salad","Soup","Dessert"]
            food = []
            for key in keys:
                if food_dict[key]:
                    food.append((key,food_dict[key]))
            menus.append(([int_to_dc[m.place]], food))

        return title, menus

        # (title, [('location', [(category, [food, food, food,....]), (category, [food, food, food,....])]), ...])


