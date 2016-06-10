var app = {
    downloads: [],

    auth: function() {
        if( ! Cookies.get('token') ) {
            $.ajax({
                url: '/refresh',
                type: 'GET',
                dataType: 'json',
                global: false,
                success: function(response) {
                    if( response.access_token ) {
                        var token = response.access_token.split('.');
                        var payload = JSON.parse(atob(token[1]));
                        var expires = new Date(payload.exp * 1000);

                        $.ajaxSetup({
                            headers: {
                                'Authorization': 'JWT ' + token
                            }
                        });

                        Cookies.set('token', token, { expires: expires });
                    }
                },
                complete: function(result) {
                    app.consoleLog({
                        type: this.type,
                        url: this.url,
                        response: JSON.stringify(result, null, 2)
                    });
                }
            });
        }
    },

    api: function(endpoint) {
        endpoint = endpoint || '';
        return 'http://api.iconfinder.dev/v2/' + endpoint;
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

        if( $('#search #query').val().trim().toString().length > 0 ) {
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

                $.getJSON(app.api('icons/' + iconId), function(result) {
                    app.increaseDownloads(iconId);
                    app.consoleLog({
                        type: this.type,
                        url: this.url,
                        response: JSON.stringify(result, null, 2)
                    });
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
        $(document).on('ready ajaxStart', app.auth);
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
