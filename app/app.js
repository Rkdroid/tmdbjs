/**
 * Created by rkdroid on 3/4/16.
 */


App = (function (Events) {

    var App = {};

    $.extend(true, App, Events, {

        init: function ()
        {

            this.provider = TmdbApi;
            this.navigation = new Snippet_Navigation(this);
            this.initRouter();
        },

        initRouter: function () {
            // To register scenes
            Router.addScene('popular', new Scene_TmdbMovies('popular'));
            Router.addScene('toprated', new Scene_TmdbMovies('toprated'));
            Router.addScene('upcoming', new Scene_TmdbMovies('upcoming'));
            Router.addScene('nowplaying', new Scene_TmdbMovies('nowplaying'));

            // Router to default scene
            Router.go('popular', 'movie/popular');
        },

    });


    Main.ready(function () {

        App.init();

    });

    return App;

})(Events, Deferrable);