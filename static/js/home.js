MenuManager = {
    menu_counter:0,
    make_menus:function (menus, title) {
        var id = MenuManager.menu_counter++;
        var accordion = $('<div class="accordion" id="menu' + id + '"></div>');
        $.map(menus, function (menu, i) {
            var location = menu[0];
            var food_list = menu[1];
            accordion.append($(
                '<div class="accordion-group">' +
                    '<div class="accordion-heading">' +
                    '<a class="accordion-toggle" data-toggle="collapse" data-parent="#menu' + id + '" href="#menu' + id + 'collapse' + i + '">' +
                    location +
                    '</a>' +
                    '</div>' +
                    '<div id="menu' + id + 'collapse' + i + '" class="accordion-body collapse' + (i === 0 ? ' in' : '') + '">' +
                    '<div class="accordion-inner">' +
                    MenuManager.organize_food(food_list) +
                    '</div> ' +
                    '</div> ' +
                    '</div>'
            ));
        });
        var title_element = $('<h3 class="menu-title">' + title + '</h3>');
        var container = $('<div></div>');
        container.append(title_element);
        container.append(accordion);
        return container;
    },
    organize_food: function(food_list) {
        var food_html = "";
        $.map(food_list,function(food_tuple) {
            food_html += "<ul><li><h4>" + food_tuple[0] + "</h4></li>";
            $.map(food_tuple[1],function(name) {
                food_html += "<li>" + name + "</li>";
            });
            food_html += "</ul>";
        });
        return food_html;
    },
    make_placeholder:function () {
        return $('<div class="loading">' +
            '<h3>Loading...</h3>' +
            '<img src="/static/img/menu-loader.gif"></img>' +
            '</div>');
    },
    fill_placeholder:function (placeholder, menu_id, direction) {
        $.ajax('/fetch_menu', {
            data:{
                'menu_id':menu_id
            },
            success:function (data) {
                placeholder.html(MenuManager.make_menus(data.menus, data.title));
                if (direction === 'next') {
                    MenuManager.newest_id = data.next;
                } else if (direction === 'prev') {
                    MenuManager.oldest_id = data.prev;
                }
            }
        });
    },
    append_menu:function (menu_obj) {
        var carousel = $('#menu-carousel');
        var carousel_item = $('<div class="item' + (carousel.children().length ? '' : ' active') + '"></div>');
        carousel_item.append(menu_obj);
        carousel.append(carousel_item);
        return carousel_item;
    },
    prepend_menu:function (menu_obj) {
        var carousel = $('#menu-carousel');
        var carousel_item = $('<div class="item' + (carousel.children().length ? '' : ' active') + '"></div>');
        carousel_item.append(menu_obj);
        carousel.prepend(carousel_item);
        return carousel_item;
    },
    show_prev_menu:function () {
        if ($('.item.active').index() == 0) {
            // Add placeholder div
            var placeholder_contents = MenuManager.make_placeholder();
            var placeholder = MenuManager.prepend_menu(placeholder_contents);
            MenuManager.fill_placeholder(placeholder, MenuManager.oldest_id, 'prev');
        }
        $('#myCarousel').carousel('prev');
        return false;
    },
    show_next_menu:function (e) {
        if ($('.item.active').index() == $('.item').length - 1) {
            // Add placeholder div
            var placeholder_contents = MenuManager.make_placeholder();
            var placeholder = MenuManager.append_menu(placeholder_contents);
            MenuManager.fill_placeholder(placeholder, MenuManager.newest_id, 'next');
        }
        $('#myCarousel').carousel('next');
        return false;
    },
    listen:function () {
        // Listen to select a different menu side to side,
        $('#prev-menu').click(MenuManager.show_prev_menu);
        $('#next-menu').click(MenuManager.show_next_menu);
        $(document).keydown(function (e) {
            if (e.keyCode === 37) { // Left
                MenuManager.show_prev_menu();
            } else if (e.keyCode === 39) { // Right
                MenuManager.show_next_menu();
            }
        });
        // Listen to select a different location up and down
        var lockAccordion = false;
        $(document).keydown(function (e) {
            if ((e.keyCode === 38 || e.keyCode === 40) && !lockAccordion) { // Up or Down
                // Find accordion body that is in
                var bodies = $('.item.active').find('.accordion-body');
                for (var i = 0; i < bodies.length; i++) {
                    var body = $(bodies[i]);
                    if (body.hasClass('in')) {
                        // If up key pressed, target previous entry, else target next entry
                        var target = e.keyCode === 38 ? i-1 : i+1;
                        if (0 <= target && target < bodies.length) {
                            // If target is valid, hide current and show target
                            var target_element = $(bodies[target])
                            var data_obj = {
                                parent: "#" + target_element.parent().parent().attr('id'),
                                toggle:'collapse'
                            }
                            var options = target_element.data('collapse') ? 'toggle' : data_obj;
                            target_element.collapse(options);
                        }
                        break;
                    }
                }
            }
        });
        $(document).bind('show', function (e) {
            lockAccordion = true;
        });
        $(document).bind('shown', function (e) {
            lockAccordion = false;
        });
    }
};

/*
 {
 title: "MealTitle"
 menus: [
 (title, [('location', [(category, [food, food, food,....]), (category, [food, food, food,....])]), ...])
 ...
 ],
 next: "IDOfNextMenu",
 prev: "IDOfPrevMenu"
 }
 */

$(document).ready(function () {
    // Make menu accordion
    $.ajax("/fetch_menu", {
        success:function (data) {
            var menus_obj = MenuManager.make_menus(data.menus, data.title);
            MenuManager.append_menu(menus_obj);
            MenuManager.oldest_id = data.prev;
            MenuManager.newest_id = data.next;
        }
    });
    $('.carousel').carousel({
        interval:false
    });
    MenuManager.listen();
});