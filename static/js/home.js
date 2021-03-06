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
    register: function (username, username_info, password, password_info, email, email_info) {
        $.ajax({
            url: "/register",
            type: "POST",
            data: {
                'username': username,
                'password': password,
                'email': email
            },
            success: function (response) {
                if (response === "ok") {
                    // Successfully registered
                    Users.dialog.modal('hide');
                    Users.logged_in(username);
                } else {
                    // Failed to register
                    $.each(response, function (field, message) {
                        var div;
                        if (field === "email") {
                            div = email_info;
                        } else if (field === "username") {
                            div = username_info;
                        } else if (field === "password") {
                            div = password_info;
                        }
                        Users.info_error(div, message);
                    });
                    Users.dialog.shake();
                }
            },
            failure: function () {
                // Failed to register
            }
        });
    },
    login: function (username, password, remember) {
        $.post(
            "/login",
            {
                'username': username,
                'password': password,
                'remember': remember
            },
            function () {
                Users.dialog.modal('hide');
                Users.logged_in(username);
            }
        )

    },
    logged_in: function (username) {
        window.username = username;
        $('#user-container').html(
            "<a href='/profile'>" + username + "</a> | <a href='#' id='logout'>Logout</a>"
        );
        Users.listen();
    },
    logout: function () {
        // Don't know what happens if this fails. Oh well, I guess
        $.post("/logout", {}, function () {
            Users.logged_out();
        });
    },
    logged_out: function () {
        window.username = null;
        $('#user-container').html(
            "<a id='login' href='#'>Login</a> | <a id='register' href='#'>Register</a>"
        );
        Users.listen();
    },
    info_clear: function (div) {
        div.html("");
        div.attr({"class":""});
        div.unbind('mouseover');
    },
    info_error: function (div, message) {
        Users.info_clear(div);
        div.attr({"class":"icon-remove"});
        div.mouseover(function (e) {
            popup(message, 155);
        });
    },
    info_okay: function (div) {
        Users.info_clear(div);
        div.attr({"class":"icon-ok"});
        div.unbind('mouseover');
    },
    info_email: function (div) {
        Users.info_clear(div);
        div.html($("<a onmouseover=\"popup('<b>Optional:</b> Used for username and password recovery.')\">" +
            "<img src='/static/img/question_mark.jpg'/>" +
            "</a>"));
    },
    password_match: function (password, confirm, div, force_error) {
        force_error = !!force_error;
        if (password.length - confirm.length > 3 && !force_error) {
            Users.info_clear(div);
            return false;
        } else if (password !== confirm) {
            Users.info_error(div, "Passwords do not match.");
            return false;
        } else {
            Users.info_okay(div);
            return true;
        }
    },
    listen: function () {
        $('#register').click(function () {
            var username = $("<input type='text' placeholder='Username'>"),
                username_info = $("<div></div>"),
                password = $("<input type='password' placeholder='Password'>"),
                password_info = $("<div></div>"),
                confirm_password = $("<input type='password' placeholder='Confirm Password'>"),
                confirm_password_info = $("<div></div>"),
                email = $("<input type='text' placeholder='Email'>"),
                email_info = $("<div></div>"),
                register_button = $("<button class='btn' type='submit'>Register</button>"),
                form = $("<form id='register-form'></form>"),
                cancel_callback = function () {
                    $('#pup').hide();
                };


            form.append(username);
            form.append(username_info);
            form.append(password);
            form.append(password_info);
            form.append(confirm_password);
            form.append(confirm_password_info);
            form.append(email);
            form.append(email_info);
            form.append(register_button);

            username.keyup(function () {
                if (username.val() !== "") {
                    Users.info_clear(username_info);
                }
            });
            password.keyup(function () {
                if (confirm_password.val() !== "") {
                    Users.password_match(password.val(), confirm_password.val(), confirm_password_info);
                }
            });
            confirm_password.keyup(function () {
                Users.password_match(password.val(), confirm_password.val(), confirm_password_info);
            });
            Users.info_email(email_info);
            email.keydown(function () {
                Users.info_email(email_info);
            });

            var confirm_callback = function () {
                Users.info_clear(username_info);
                Users.info_clear(password_info);
                Users.info_clear(confirm_password_info);

                // Check validity stuffs
                var can_register = true;

                if (!Users.password_match(password.val(), confirm_password.val(), confirm_password_info, true)) {
                    can_register = false;
                }
                if (username.val() === "") {
                    Users.info_error(username_info, "Username cannot be blank.");
                    can_register = false;
                }
                if (password.val() === "") {
                    Users.info_error(password_info, "Password cannot be blank.");
                    Users.info_error(confirm_password_info, "Password cannot be blank.");
                    can_register = false;
                }
                if (can_register) {
                    $("#pup").hide();
                    Users.register(
                        username.val(),
                        username_info,
                        password.val(),
                        password_info,
                        email.val(),
                        email_info
                    );
                } else {
                    $('.modal').shake();
                }

                // Don't want the dialog to close until we have confirmation registration was successful
                return false;
            };

            var div = bootbox.dialog(form, [],
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
                    confirm_callback();
                });
            });

            div.modal("show");

            // Don't do click behaviour
            return false;
        });

        $('#login').click(function () {
            var username = $("<input type='text' placeholder='Username'>"),
                password = $("<input type='password' placeholder='Password'>"),
                remember = $("<input type='checkbox'>"),
                checkbox_label = $("<label class='checkbox' style='float: left;'>Remember me</label>"),
                login_button = $("<button class='btn' type='submit'>Login</button>"),
                form = $("<form id='login-form'></form>"),
                cancel_callback = function () {};

            checkbox_label.prepend(remember);

            form.append(username);
            form.append(password);
            form.append(checkbox_label);
            form.append(login_button);

            var confirm_callback = function () {
                // Check validity stuffs
                Users.login(
                    username.val(),
                    password.val(),
                    remember.val()
                );

                // Don't want the dialog to close until we have confirmation registration was successful
                return false;
            };

            var div = bootbox.dialog(form, [],
                {
                    "header"  : "Login",
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
                    confirm_callback();
                });
            });

            div.modal("show");

            // Don't do click behaviour
            return false;
        });

        $('#logout').click(function () {
            Users.logout();
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
    if (window.username === null) {
        Users.logged_out();
    } else {
        Users.logged_in(window.username);
    }

    //jquery shake function gotten from http://jsfiddle.net/JppPG/3/
    $.fn.shake = function() {
        var distance = 10;
        this.each(function(i) {
            var init_margin = parseFloat($(this).css("marginLeft"));
            for (var x = 1; x <= 2; x++) {
                $(this).animate({ marginLeft: init_margin - distance }, 10)
                    .animate({ marginLeft: init_margin }, 50)
                    .animate({ marginLeft: init_margin + distance }, 10)
                    .animate({ marginLeft: init_margin }, 50);
            }
        });
        return this;
    };
});