MenuManager = {
    menu_counter:0,
    make_containers:function () {
        var id = MenuManager.menu_counter++;
        var dining_commons = [
            ['Crossroads', 'content1'],
            ['Cafe 3', 'content2'],
            ['Foothill', 'content3'],
            ['Clark Kerr', 'content4']
        ];
        var container = $('<div class="accordion" id="menu' + id + '"></div>');
        $.map(dining_commons, function (dining_common, i) {
            var name = dining_common[0];
            var content = dining_common[1];
            container.append($(
                '<div class="accordion-group">' +
                    '<div class="accordion-heading">' +
                    '<a class="accordion-toggle" data-toggle="collapse" data-parent="#menu' + id + '" href="#menu' + id + 'collapse' + i + '">' +
                    name +
                    '</a>' +
                    '</div>' +
                    '<div id="menu' + id + 'collapse' + i + '" class="accordion-body collapse ' + (i === 0 ? 'in' : '') + '">' +
                    '<div class="accordion-inner">' +
                    content +
                    '</div> ' +
                    '</div> ' +
                    '</div> '
            ));
        });
        return container;

    }
};

$(document).ready(function () {
    // Make menus accordion
    var carousel = $('#menu-carousel');
    for (var i = 0; i < 3; i++) {
        var item = $('<div class="item' + (i === 0 ? ' active' : '') + '"></div>');
        item.append(MenuManager.make_containers());
        carousel.append(item);
    }
    $('.carousel').carousel({
        interval:false
    });
});