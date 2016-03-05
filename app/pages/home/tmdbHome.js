/**
 * Created by rkdroid on 3/5/16.
 */

var Scene_TmdbMovies = (function (scene) {
    var Scene_TmdbMovies = function () {
        console.log('popular constructor method');
        this.construct.apply(this, arguments);
    };

    $.extend(true, Scene_TmdbMovies.prototype, Scene.prototype, {

        init: function () {
            this.$lastFocused = null;
            this.gallery = new Snippet_Coverlist(this);
        },

        create: function () {
            return $("#scene-tmdb-tpl").clone().attr('id', 'scene-tmdb');
        },

        activate: function (endPoint) {
            this.endPoint = endPoint;
        },

        render: function () {
            App.provider.getMovies(this.endPoint, {}, function(resp) {
                if (resp) {
                    console.log(resp);

                    var rows = [];
                    rows[0] = resp.results;
                    for (var row in rows) {
                        row.index = 0;
                    }

                    this.gallery.lists = rows;
                    this.gallery.renderLists();
                    this.focus();
                }
            }, this);
        },

        focus: function () {
            if (this.$lastFocused) {
                Focus.to(this.$lastFocused);
            } else {
                var $el = this.$el.find('.focusable').eq(0);
                Focus.to($el);
            }
        },

        onFocus: function ($el) {
            this.$lastFocused = $el;
        }

    });
    return Scene_TmdbMovies;
})(Scene);