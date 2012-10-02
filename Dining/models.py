from collections import defaultdict
import datetime
from django.db import models
from constants import (
    CARNIVORE,
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
)

dietary_restrictions_choices = (
    (CARNIVORE, 'Carnivore'),
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

class Dish(models.Model):
    date = models.DateField()
    meal = models.IntegerField(choices=meal_choices)
    place = models.IntegerField(choices=place_choices)
    food = models.ForeignKey(Food)

    def __unicode__(self):
        return "%s meal %s, at %s serving %s" % (self.date, self.meal, self.place, self.food.name)

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
        dishes = Dish.objects.filter(date=date, meal=meal_int)
        if meal_int == LUNCH:
            extra_dishes = Dish.objects.filter(date=date, meal=BRUNCH)
            if dishes and extra_dishes:
                meal = "Lunch/Brunch"
            elif dishes:
                meal = "Lunch"
            elif extra_dishes:
                meal = "Brunch"
            dishes = dishes | extra_dishes
        date = Dish.format_date(date)
        title = "%s - %s" % (date, meal)

        menus = defaultdict(lambda: [])
        for dish in dishes:
            menus[int_to_dc[dish.place]].append(dish.food.name)

        return title, menus.items()

        # (title, [('location', [food, food, food,....]), ...])


