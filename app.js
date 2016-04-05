_.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
};

var app = {
    api: function(endpoint) {
        endpoint = endpoint || '';
        return 'https://api.iconfinder.com/v2/' + endpoint;
    },

    search: function(query) {
        $.getJSON(this.api('icons/search?query='+query), function(result) {
            var template = $('#log-template').html();
            var compile = _.template(template);
            var data = {
                type: this.type,
                url: this.url,
                response: JSON.stringify(result, null, 2)
            };

            $('#console .log').html(compile(data));
            app.renderResults(result);
        });
    },

    renderResults: function(data) {
        var html = '';
        var template = $('#result-template').html();
        var compile = _.template(template);

        $.each(data.icons, function(index, icon) {
            var file = _.last(icon.raster_sizes);
            html += compile({ url: file.formats[0].preview_url });
        });

        $('.results').html(html).show();

        this.dragAndDrop();
    },

    dragAndDrop: function() {
        $('.results').find('img').draggable({
            containment: 'main',
            addClasses: false,
            scroll: false,
            revert: 'invalid',
            revertDuration: 200,
            helper: 'clone'
        });

        $('.diagram .placeholder').droppable({
            accept: '.results img',
            hoverClass: 'active',
            drop: function(event, ui) {
                var newElement = $(ui.draggable).clone();
                $(this).addClass('filled').html(newElement);
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
    },

    init: function() {
        this.bindEvents();
    }
};

$(function() {
    app.init();
});
