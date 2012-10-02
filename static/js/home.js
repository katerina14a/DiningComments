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
                    '<div id="menu' + id + 'collapse' + i + '" class="accordion-body collapse ' + (i === 0 ? 'in' : '') + '">' +
                    '<div class="accordion-inner">' +
                    food_list.join("<br/>") +
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
    make_placeholder:function () {
        return $('<p>PLACEHOLDER</p>');
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
    slide_listener:function () {
        $('#prev-menu').click(function (e) {
            if ($('.item.active').index() == 0) {
                // Add placeholder div
                var placeholder_contents = MenuManager.make_placeholder();
                var placeholder = MenuManager.prepend_menu(placeholder_contents);
                MenuManager.fill_placeholder(placeholder, MenuManager.oldest_id, 'prev');
            }
            $('#myCarousel').carousel('prev');
            return false;
        });
        $('#next-menu').click(function (e) {
            if ($('.item.active').index() == $('.item').length - 1) {
                // Add placeholder div
                var placeholder_contents = MenuManager.make_placeholder();
                var placeholder = MenuManager.append_menu(placeholder_contents);
                MenuManager.fill_placeholder(placeholder, MenuManager.newest_id, 'next');
            }
            $('#myCarousel').carousel('next');
            return false;
        });
    }
};

/*
 {
 menus: [
 [DCName, [Food1, Food2, ...]],
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
    MenuManager.slide_listener();
});