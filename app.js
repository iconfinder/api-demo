_.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
};

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

    search: function(query) {
        $('.results').hide().empty();

        $.getJSON(this.api('icons/search?query='+query+'&count=30&vector=true'), function(result) {
            app.renderResults(result);
            app.consoleLog({
                type: this.type,
                url: this.url,
                response: JSON.stringify(result, null, 2)
            });
        });
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

    makeDraggable: function() {
        $('.results').find('img').draggable({
            appendTo: 'main',
            containment: 'main',
            addClasses: false,
            scroll: false,
            revert: 'invalid',
            revertDuration: 200,
            helper: 'clone',
            start: function() {
                $('.results').fadeOut();
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
        $('#search').on('submit', function() {
            var query = $(this).find('#query').val().trim().toString();

            if( query.length > 0 ) {
                app.search(query);
            }

            return false;
        });

        $('#search input').on('focus', function() {
            var input = $(this).val().trim();
            var results = $('.results').children();

            if( input.length > 0 && results.length > 0 ) {
                $('.results').fadeIn();
            }
        });

        $('.toggle-console').on('click', function() {
            $('aside').toggleClass('active');
        });
    },

    init: function() {
        this.makeDroppable();
        this.bindEvents();
    }
};

$(function() {
    app.init();
});
