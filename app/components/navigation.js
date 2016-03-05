/**
 * Created by rkdroid on 3/5/16.
 */

var Snippet_Navigation = (function (snippet) {

    var Snippet_Navigation = function () {
        this.construct.apply(this, arguments);
    };

    $.extend(true, Snippet_Navigation.prototype, Snippet.prototype, {

        selector: '#navigation',

        init: function () {
            this.$lastFocused = null;
            this.$el = $(this.selector);
            this.el = this.$el;
            this.render();
        },

        render: function () {

        },

        navigate: function (direction) {
            if (direction == 'left') {
                Focus.to(this.getFocusable(-1, true));
            } else if (direction == 'right') {
                Focus.to(this.getFocusable(1, true));
            } else if (direction == 'up') {

            } else if (direction == 'down') {
                Router.activeScene.focus();
            }
        },

        onClick: function ($el, event) {
            this.onClickEnter($el);
        },

        onEnter: function ($el, event) {
            this.onClickEnter($el);
        },

        onClickEnter: function($el) {
            var scene = $el.attr('data-scene');
            var endPoint = 'movie/popular';

            this.$lastFocused = $el;
            if(scene === 'popular') {
                endPoint = 'movie/popular';
            } else if(scene === 'toprated') {
                endPoint = 'movie/top_rated';
            } else if(scene === 'upcoming') {
                endPoint = 'movie/upcoming';
            } else if(scene === 'nowplaying') {
                endPoint = 'movie/now_playing';
            }
            Router.go(scene, endPoint);
        },

        hideOverlay: function () {
            this.el.find('div.top-navigation .overlay').hide();
            this.el.find('div.top-navigation').css('opacity', 1);
        },

        showOverlay: function () {
            this.el.find('div.top-navigation .overlay').show();
            this.el.find('div.top-navigation').css('opacity', 0.1);
        },

        screenOverlay: function () {
          //  Router.activeScene.inactive = true;
          //  Router.activeScene.el.find('.overlay').show();
          //  Router.activeScene.el.css('opacity', 0.1);
        },

        focus: function () {
            if (this.$lastFocused) {
                Focus.to(this.$lastFocused);
            }
            else {
                var li = this.el.find('> div.top-navigation > ul > li.active').eq(0);

                if (!li || !li.length) {
                    li = this.el.find('> div.top-navigation > ul > li.focusable');
                    li = this.rtl ? li.last() : li.first();
                }

                Focus.to(li);
            }
           // this.screenOverlay();
        },

        onFocus: function ($el) {
           // this.$lastFocused = $el;
        }

    });

    return Snippet_Navigation;
})(Snippet);