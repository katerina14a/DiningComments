MenuManager = {
    menu_counter: 0,
    make_menus:function (menus, active) {
        active = !!active;
        var id = MenuManager.menu_counter++;
        var container = $('<div class="accordion" id="menu' + id + '"></div>');
        $.map(menus, function (menu, i) {
            var name = menu[0];
            var food_list = menu[1];
            container.append($(
                '<div class="accordion-group">' +
                    '<div class="accordion-heading">' +
                    '<a class="accordion-toggle" data-toggle="collapse" data-parent="#menu' + id + '" href="#menu' + id + 'collapse' + i + '">' +
                    name +
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
        var carousel_item = $('<div class="item' + (active ? ' active' : '') + '"></div>');
        carousel_item.append(container);
        return carousel_item;
    },
    append_menu: function (menu_obj) {
        var carousel = $('#menu-carousel');
        carousel.append(menu_obj);
    }
};

/*
 {
 menus: [
 [DCName, [Food1, Food2, ...]],
 ...
 ],
 //    next: "IDOfNextMenu",
 //    prev: "IDOfPrevMenu"
 }
 */

$(document).ready(function () {
    // Make menus accordion
    $.ajax("/fetch_menu", {
        success: function (data) {
            var menus_obj = MenuManager.make_menus(data.menus, true);
            MenuManager.append_menu(menus_obj)
        }
    });
    $('.carousel').carousel({
        interval:false
    });
});