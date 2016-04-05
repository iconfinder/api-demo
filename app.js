var app = {
    api: function(endpoint) {
        endpoint = endpoint || '';
        return 'https://api.iconfinder.com/v2/' + endpoint;
    },

    search: function(query) {
        $.getJSON(this.api('icons/search?query='+query), function(result) {
            return result;
        });
    },

    init: function() {
        console.log("Hello");
    }
};

$(function() {
    app.init();
});
