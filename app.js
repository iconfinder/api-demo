var app = {
    api: function(endpoint) {
        endpoint = endpoint || '';
        return 'https://api.iconfinder.com/v2/' + endpoint;
    },

    consoleLog: function(data) {
        var template = $('#log-template').html();
        var compile = _.template(template);

        $('#console .log').html(compile(data));
    },

    indicateLoading: function(state) {
        $('#search button i').toggleClass('fa-circle-o-notch fa-spin', state);
        $('#search input[type="text"]').attr('disabled', state);
    },

    search: function(e) {
        e.preventDefault();

        if( $(this).find('#query').val().trim().toString().length > 0 ) {
            var query = $('#search').serialize();

            app.indicateLoading(true);

            $.getJSON(app.api('icons/search?' + query), function(result) {
                app.renderResults(result);
                app.indicateLoading(false);
                app.consoleLog({
                    type: this.type,
                    url: this.url,
                    response: JSON.stringify(result, null, 2)
                });
            });
        }

        $('.results').hide().empty();
    },

    renderResults: function(data) {
        var html = '';
        var template = $('#result-template').html();
        var compile = _.template(template);

        if( data.total_count > 0 ) {
            $.each(data.icons, function(index, icon) {
                var file = _.last(icon.raster_sizes);
                html += compile({
                    url: file.formats[0].preview_url,
                    icon_id: icon.icon_id
                });
            });

            $('.results').html(html).fadeIn();

            this.makeDraggable();
        }
    },

    toggleResults: function() {
        var input = $(this).val().trim();
        var results = $('.results').children();

        if( input.length > 0 && results.length > 0 ) {
            $('.results').fadeIn();
        }
    },

    makeDraggable: function() {
        $('.results').find('img').draggable({
            appendTo: 'main',
            containment: 'main',
            addClasses: false,
            scroll: false,
            revert: 'invalid',
            cursor: 'move',
            revertDuration: 200,
            helper: 'clone',
            start: function() {
                $('.results').fadeOut();
            },
            stop: function(event, ui) {
                console.log(event, ui);
            }
        });
    },

    makeDroppable: function() {
        $('.diagram .placeholder').droppable({
            accept: '.results img',
            hoverClass: 'active',
            drop: function(event, ui) {
                var newElement = $(ui.draggable).clone().removeClass('ui-draggable-handle');

                $(this).addClass('filled').html(newElement);

                app.consoleLog({
                    type: 'GET',
                    url: app.api('icons/' + newElement.data('icon-id')),
                    response: 'Icon file download'
                });
            }
        });
    },

    bindEvents: function() {
        $('#search').on('submit', app.search);
        $('#search input').on('focus', app.toggleResults);
        $('.toggle-console').on('click', function() {
            $('aside').toggleClass('active');
        });
    },

    init: function() {
        this.makeDroppable();
        this.bindEvents();
    }
};

_.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
};

$.fn.serializeObject = function() {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

$(function() {
    app.init();
});
