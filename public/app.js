var app = {
    downloads: [],

    token: function() {
        return Cookies.get('token') || $.ajax({
            url: '/refresh',
            type: 'GET',
            dataType: 'json',
            global: false,
            success: function(response) {
                if( response.access_token ) {
                    var token = response.access_token.split('.');
                    var payload = JSON.parse(atob(token[1]));

		    // subtract 2 seconds to take slow reponse times into account
		    var ttl = (payload.exp - payload.iat) * 1000 - 2 * 1000;
                    var expires_unix_time = Date.now() + ttl;
                    var expires = new Date(expires_unix_time);

		    console.log("expires", new Date(expires_unix_time));
		    console.log("now", new Date(Date.now()));

                    Cookies.set('token', response.access_token, { expires: expires });

                    return token;
                }
            },
            complete: function(result) {
                app.consoleLog(this, result);
            }
        });
    },

    api: function(endpoint) {
        endpoint = endpoint || '';
        return 'http://api.iconfinder.dev/v2/' + endpoint;
    },

    consoleLog: function(request, response) {
        var template = $('#log-template').html();
        var compile = _.template(template);
        var data = {
            type: request.type,
            url: request.url,
            response: JSON.stringify(response, null, 2)
        };

        $('#console .log').html(compile(data));
    },

    indicateLoading: function(state) {
        $('#search button i').toggleClass('fa-circle-o-notch fa-spin', state);
        $('#search input[type="text"]').attr('disabled', state);
    },

    search: function(e) {
        e.preventDefault();

        if( $('#search #query').val().trim().toString().length > 0 ) {
            var query = $('#search').serialize();

            app.indicateLoading(true);

	    console.log(typeof app.token());

            $.ajax({
                url: app.api('icons/search?' + query),
                type: 'GET',
                headers: {
                    'Authorization': 'JWT ' + app.token()
                },
                complete: function(result) {
		    console.log(result);
                    app.renderResults(result);
                    app.indicateLoading(false);
                    app.consoleLog(this, result);
                }
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
            }
        });
    },

    makeDroppable: function() {
        $('.diagram .placeholder').droppable({
            accept: '.results img',
            hoverClass: 'active',
            drop: function(event, ui) {
                var newElement = $(ui.draggable).clone().removeClass('ui-draggable-handle');
                var iconId = newElement.data('icon-id');

                $(this).addClass('filled').html(newElement);

                $.ajax({
                    url: app.api('icons/' + iconId),
                    type: 'GET',
                    headers: {
                        'Authorization': 'JWT ' + app.token()
                    },
                    complete: function(result) {
                        app.increaseDownloads(iconId);
                        app.consoleLog(this, result);
                    }
                });
            }
        });
    },

    increaseDownloads: function(iconId) {
        app.downloads.push(iconId);
        app.downloads = _.uniq(app.downloads);

        $('#downloads strong').html(app.downloads.length);
    },

    bindEvents: function() {
        $(document).on('ready', app.token);
        $('#search').on('submit', app.search);
        $('#search input').on('focus', app.toggleResults);
        $('#search').on('change', 'input[type="checkbox"]', app.search);
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
    interpolate: /\{\{(.+?)\}\}/g,
    escape: /\{\{-(.*?)\}\}/g
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
