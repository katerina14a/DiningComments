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
        var params = menu_id === null ? {} : { 'menu_id':menu_id };
        $.ajax('/fetch_menu', {
            data:params,
            success:function (data) {
                placeholder.html(MenuManager.make_menus(data.menus, data.title));
                if (direction === 'next') {
                    MenuManager.newest_id = data.next;
                } else if (direction === 'prev') {
                    MenuManager.oldest_id = data.prev;
                } else if (direction === 'both') {
                    MenuManager.newest_id = data.next;
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
            if (MenuManager.oldest_id === 'stop') {
                return false;
            }
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
            if (MenuManager.newest_id === 'stop') {
                return false;
            }
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

Users = {
    register: function (username, password, email) {
        $.ajax({
            url: "/register/",
            type: "POST",
            data: {
                'username': username,
                'password': password,
                'email': email
            },
            success: function (response) {
                if (response === "ok") {
                    console.log("Registered user " + username);
                    Users.dialog.modal('hide');
                    // Successfully registered
                } else {
                    // Failed to register
                }
            },
            failure: function () {
                // Failed to register
            }
        });
    },
    listen: function () {
        $('#register').click(function () {
            var username = $("<input type='text' placeholder='Username'>"),
                password = $("<input type='password' placeholder='Password'>"),
                confirm_password = $("<input type='password' placeholder='Confirm Password'>"),
                email = $("<input type='text' placeholder='Email'>"),
                form = $("<form><input type='submit' style='position: absolute; left: -9999px'/></form>"),
                cancel_callback = function () {};

            form.append(username);
            form.append(password);
            form.append(confirm_password);
            form.append(email);

            var confirm_callback = function () {
                // Check validity stuffs
                Users.register(
                    username.val(),
                    password.val(),
                    email.val()
                );

                // Don't want the dialog to close until we have confirmation registration was successful
                return false;
            };

            var div = bootbox.dialog(form,
                [{
                    'label': "Register",
                    'class': 'btn',
                    'callback': confirm_callback
                }],
                {
                    "header"  : "Create an Account",
                    // explicitly tell dialog NOT to show the dialog...
                    "show"    : false,
                    "onEscape": cancel_callback
                }
            );

            Users.dialog = div;

            div.on("shown", function() {
                username.focus();

                // ensure that submitting the form (e.g. with the enter key)
                // replicates the behaviour of a normal prompt()
                form.submit(function(e) {
                    e.preventDefault();
                    div.find(".btn").click();
                });
            });

            div.modal("show");

            // Don't do click behaviour
            return false;
        });
    }
};

var csrfSetup = function () {
    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    var csrftoken = getCookie('csrftoken');
    $.ajaxSetup({
        crossDomain: false, // obviates need for sameOrigin test
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type)) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
};


$(document).ready(function () {
    csrfSetup();

    // Add placeholder div
    var placeholder_contents = MenuManager.make_placeholder();
    var placeholder = MenuManager.append_menu(placeholder_contents);
    MenuManager.fill_placeholder(placeholder, null, 'both');
    // Make menu accordion
    $('.carousel').carousel({
        interval:false
    });
    MenuManager.listen();
    Users.listen();
});