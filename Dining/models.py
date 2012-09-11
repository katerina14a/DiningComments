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
