/**
 * Created by rkdroid on 3/4/16.
 */


Snippet_Coverlist = (function (snippet) {
    var scope = this;

    var Snippet_Coverlist = function () {
        this.construct.apply(this, arguments);
    };

    $.extend(true, Snippet_Coverlist.prototype, Snippet.prototype, {

        index: 0,
        itemsPerRow: 4,
        itemsPerColumn: 2,
        itemsPerGrid: 8,
        itemsVisible: 1,
        imageWidth: 230,
        lists: [],
        itemsPerPage: 30,
        fullyDownloaded: false, // flag if all data in coverlist are downloaded
        gridView: true,
        allowGridView: true,
        allowListView: false,
        goBackToListView: false, // set if covers have been switched from listview to gridview then is enabled return to switch to listview

        init: function () {
            this.listStartIndex = 0;
            this.listActiveIndex = 0;
            this.tvshows = false;

            this.render();
        },

        create: function () {
            return this.parent.$el.find('ul.grid');
        },

        render: function () {
            this.el = this.$el;
            this.el.addClass('grid-' + this.itemsPerRow + '-' + (this.itemsPerRow * this.itemsPerColumn));
            this.el.toggleClass('tv-shows', this.tvshows);
            this.el.toggleClass('grid-view', this.allowGridView);

            if (!this.arrowLeft) {
                this.arrowLeft = $('<div class="nav-left' + (this.gridView ? '' : ' hide') + '" />').appendTo(this.el.parent());
                this.arrowRight = $('<div class="nav-right' + (this.gridView ? '' : ' hide') + '" />').appendTo(this.el.parent());

                this.arrowUp = $('<div class="nav-up' + (this.gridView ? ' hide' : '') + '" style="display:none" />').appendTo(this.el.parent());
                this.arrowDown = $('<div class="nav-down' + (this.gridView ? ' hide' : '') + '" style="display:none" />').appendTo(this.el.parent());

                var that = this;
                this.arrowLeft.bind('click', function () {
                    that.scroll(-1);
                    return false;
                });

                this.arrowRight.bind('click', function () {
                    that.scroll(1);
                    return false;
                });
                this.arrowUp.bind('click', function () {
                    if (!scope.gridView) {
                        scope.onUpDownArrowNav(-1);
                        return;
                    }

                    that.scroll(-1);
                    return false;
                });

                this.arrowDown.bind('click', function () {
                    if (!scope.gridView) {
                        scope.onUpDownArrowNav(1);
                        return;
                    }

                    that.scroll(1);
                    return false;
                });

                this.overlay = $('<div class="grid-overlay" />').appendTo(this.el.parent());
            }

            this.arrowLeft.hide();
            this.arrowRight.hide();

        },

        renderLists: function (focus, reset) {
            var active, list;
            this.el.empty();

            if (reset) {
                list = this.lists[this.listActiveIndex];
                if (list) {
                    list.index = list.startIndex = 0;
                }
            }

            if (this.gridView) {
                if (this.lists[this.listActiveIndex]) {
                    this.lists[this.listActiveIndex].index = this.lists[this.listActiveIndex].index || this.startIndex;

                    this.el.append('<li class="row grid-view" data-list="' + this.listActiveIndex + '">'  + ((this.allowListView && this.lists.length > 1/*(this.lists[this.listActiveIndex].items.length > (this.itemsPerRow*this.itemsPerColumn) || (this.lists.length > 1))*/) ? '<span class="list-toggle-grid focusable"><span>' + Util.translate('list_view') + '</span></span>' : '') + '<div class="arrows"><span class="u"></span><span class="d"></span></div>' + '<div class="items rtl"></div></li>');

                   this.el.find('.list-toggle-grid').bind('click', function () {
                        scope.toggleGridView();
                        return false;
                    });

                    this.renderGridItems();
                }

                return;
            }

            for (var i = this.listStartIndex; i < (this.listStartIndex + this.itemsPerColumn); i++) {
                if (this.lists[i] && (this.myflix || this.lists[i].items.length)) {
                    this.lists[i].index = this.lists[i].index || this.startIndex;
                    this.el.append('<li class="row" data-list="' + i + '">' + '<span class="list-label"><span class="list-label-title">' + this.lists[i].title + '</span><span class="list-label-count">1/10</span></span>' + ((this.allowGridView && this.lists.length > 1/*(this.lists[i].items.length > (this.itemsPerRow*this.itemsPerColumn) || (this.lists.length > 1))*/) ? '<span class="list-toggle-grid focusable"><span>' + Util.translate('grid_view') + '</span></span>' : '') + '<div class="arrows"><span class="l"></span><span class="r"></span></div>' + '<div class="nav-right" /><div class="nav-left" />' + '<div class="items"></div></li>');

                    this.el.find('.list-toggle-grid').unbind('click').bind('click', function () {
                        scope.listActiveIndex = $(this).parent().attr('data-list') >> 0;
                        scope.toggleGridView();
                        return false;
                    });

                    this.el.find('.nav-right').unbind('click').bind('click', function () {
                        scope.listActiveIndex = $(this).parent().attr('data-list') >> 0;
                        scope.scrollList(1);
                        return false;
                    });

                    this.el.find('.nav-left').unbind('click').bind('click', function () {
                        scope.listActiveIndex = $(this).parent().attr('data-list') >> 0;
                        scope.scrollList(-1);
                        return false;
                    });

                    this.renderItems(i, focus);
                }
            }

            if (Main.device[0] == 'lg' || CONFIG.mouse.automatic) {
                this.arrowLeft.hide();
                this.arrowRight.hide();
                this.arrowUp.toggle(this.listStartIndex > 0);
                this.arrowDown.toggle(this.lists.length - (this.listStartIndex + this.itemsPerColumn) > 0);
            }

            active = this.el.find('li[data-list="' + this.listActiveIndex + '"]').not('.emptylist');
            active.addClass('active-row');

        },

        renderGridItems: function (dir, wheelscroll) {
            if (typeof dir == 'boolean') {
                wheelscroll = dir;
            }
            var movie, list = this.lists[this.listActiveIndex], index = -1, startIndex = list.startIndex;
            var el = this.el.find('li[data-list="' + this.listActiveIndex + '"] .items');

           // APP.keysEnabled = false;

            el.empty();
            el = $('<ul />').appendTo(el);

            if (!list.index) {
                list.index = 0;
            }

            if (!list.startIndex) {
                list.startIndex = 0;
            }


            if (!wheelscroll && Math.abs(dir) != this.itemsPerRow && list.index % this.itemsPerRow == 0 && (list.startIndex - this.itemsPerColumn) >= 0) {
                //console.log('**1');
                list.startIndex -= this.itemsPerColumn;

            } else if (!wheelscroll && Math.abs(dir) != this.itemsPerRow && (list.index + 1) % this.itemsPerRow == 0 && (list.startIndex + this.itemsPerGrid) < list.length) {
                list.startIndex += this.itemsPerColumn;
            }

            var renderLi = function (movie, i, k) {
                var li = $('<li class="item focusable" data-index="' + k + '" data-movie="' + i + '" />');
                var img = $('<img src="' + App.provider.imageUrl + movie.poster_path + '" style="background-image:url(\'' + (scope.tvshows ? scope.defaultEpisodeImage : scope.defaultMovieImage) + '\')" />');

                img.attr('width', 252);
                img.attr('height', 362);

                var label = null;

                img[0].onerror = function () {
                    this.src = (scope.tvshows ? scope.defaultEpisodeImage : scope.defaultMovieImage);
                };

                li.attr('data-id', movie.id);
                li.append(img);

                li.appendTo(el);
            };


            for (var i = 0; i < this.itemsPerGrid; i++) {
                var index = ((i % this.itemsPerRow) * this.itemsPerColumn + (Math.floor(i / this.itemsPerRow) % this.itemsPerColumn)) + list.startIndex;

                if (movie = list[index]) {
                    renderLi(movie, index, i);
                }
                else {
                    var li = $('<li class="item" data-index="' + i + '" />');
                        li.appendTo(el);
                }
            }


            el.find('li.focusable.item').bind('focus', function () {
                scope.onItemFocus($(this), list.items, true);
            });

            var arrows = this.el.find('li[data-list="' + this.listActiveIndex + '"] .arrows');

            if (list.length > this.itemsPerGrid && Main.device[0] != 'lg' && !CONFIG.mouse.automatic) {
                arrows.show();
                arrows.find('.u').toggleClass('active', list.startIndex != 0);
                arrows.find('.d').toggleClass('active', (list.startIndex + this.itemsPerGrid) < list.items.length);

            } else {
                arrows.hide();
            }

            if (Main.device[0] == 'lg' || CONFIG.mouse.automatic) {
                    this.arrowLeft.toggle(list.startIndex != 0 && list.length > this.itemsPerGrid);
                    this.arrowRight.toggle((list.startIndex + this.itemsPerGrid) < list.length);
            }
            this.arrowUp.hide();
            this.arrowDown.hide();


            var li = this.el.find('li[data-list="' + this.listActiveIndex + '"] .items li.focusable.item[data-index="' + list.index + '"]');

            var m_idx = parseInt(li.attr('data-movie'), 10) + 1;

            if (startIndex != list.startIndex) {
                list.index += -1 * (dir || 0);
            }

            var focused = el.find('li[data-index="' + list.index + '"]');

            if (!focused.length) {
                focused = el.find('li:first');
                list.index = parseInt(focused.attr('data-index'));
            }

            el.unbind('mousewheel').bind('mousewheel', function (e) {
                var delta = e.wheelDelta || e.originalEvent.wheelDelta;

                if (scope.hasFocus()) {
                    scope.scroll(delta > 0 ? -1 : 1, true);
                }
            });


            var that = this;

            setTimeout(function () {
               // scope.bind();
                that.focus();
            }, 0);

        },

        renderItems: function (listIndex, focus, dir) {

        },

        toggleGridView: function () {
            if (!this.gridView) {
                this.goBackToListView = true;
            }
            else {
                this.goBackToListView = false;
            }

            this.gridView = !this.gridView;

            if (this.gridView) {
                this.arrowLeft.removeClass('hide');
                this.arrowRight.removeClass('hide');
            }
            else {
                this.arrowLeft.addClass('hide');
                this.arrowRight.addClass('hide');
            }

            this.lists[this.listActiveIndex].startIndex = 0;
            this.renderLists();
        },

        movieListIndex: function (dir) {
            var i, li, episode, forceMove = false;

            if (!this.gridView) {
                var list = this.lists[this.listActiveIndex];
                i = list.index;

                list.index += dir;

                if (list.index < 0) {
                    list.index = 0;

                } else if (list.index > list.length - 1) {
                    list.index = (list.length - 1);
                }

                if (list.index >= this.itemsPerRow - 1) {
                    list.startIndex += dir;
                }

                if (i !== list.index) {
                    this.renderItems(this.listActiveIndex);
                }

                return (i !== list.index);
            }

            var list = this.lists[this.listActiveIndex];
            i = list.index;

            if (this.gridView && ((i >= this.itemsPerRow * (this.itemsPerColumn - 1)) && dir != 1 && dir > 0)) {
                return;
            }
            else if (this.gridView && ((i < this.itemsPerRow) && dir != -1 && dir < 0)) {
                return;
            }

            if (this.gridView && ((i % this.itemsPerRow === 0 && dir === -1) || (i % this.itemsPerRow === (this.itemsPerRow - 1) && dir === 1))) {
                forceMove = true;
            }
            else {
                if (this.el.find('li[data-list="' + this.listActiveIndex + '"] .items li.focusable.item[data-index="' + (list.index + dir) + '"]').length) {
                    list.index += dir;
                }
            }

            if (list.index < 0) {
                list.index = 0;
                dir = 0;

            } else if (this.gridView) {
                if (this.el.find('li[data-list="' + this.listActiveIndex + '"] .items li.focusable.item[data-index="' + list.index + '"]').index() >= 0) {
                    list.index = this.el.find('li[data-list="' + this.listActiveIndex + '"] .items li.focusable.item[data-index="' + list.index + '"]').index();
                }
            } else if (!this.gridView) {

            } else if (list.index + list.startIndex > list.items.length - 1) {
                li = this.el.find('li[data-list="' + this.listActiveIndex + '"] .items li.focusable.item');
                list.index = li.last().index();
                dir = 0;
            }

            if (i !== list.index || forceMove) {
                if (this.gridView) {
                    this.renderGridItems(dir);

                } else {
                    this.renderItems(this.listActiveIndex);
                }
            }

            li = this.el.find('li[data-list="' + this.listActiveIndex + '"] .items li.focusable.item[data-index="' + list.index + '"]');

            if (parseInt(li.attr('data-movie'), 10) < this.itemsPerColumn && i % this.itemsPerRow == 0) {
                return false;
            }
            return true;//(i !== list.index || forceMove);

        },


        onLeftRightKeyNav: function (dir) {

        },

        onLeftRightArrowNav: function (dir) {
            var list = this.lists[this.listActiveIndex],
                idx = list.startIndex;

            if (list) {
                idx = (idx + dir);

                if (idx < 0) {
                    idx = 0;

                } else if (idx > list.items.length - this.itemsPerRow) {
                    idx = list.items.length - this.itemsPerRow;
                }

                if (idx != list.startIndex && list.items.length > this.itemsPerRow) {
                    list.index = list.startIndex = idx;
                    this.renderItems(this.listActiveIndex);
                }
            }
        },

        onUpDownKeyNav: function (dir) {

        },

        onUpDownArrowNav: function (dir) {

        },

        scroll: function (dir, wheelscroll) {
            var list = this.lists[this.listActiveIndex],
                idx = list.startIndex;
            if (list) {
                if (dir > 0 && this.el.find('li.active-row li.focusable.item').length >= (this.itemsPerRow * this.itemsPerColumn) ||
                    dir < 0) {
                    idx = (idx + (dir * this.itemsPerColumn));

                    if (idx < 0) {
                        idx = 0;

                    } else if (idx > list.length - this.itemsPerColumn - 1) {
                        idx = list.length - this.itemsPerColumn - 1;
                    }

                    if (idx != list.startIndex && list.length > this.itemsPerGrid) {

                        if (wheelscroll) {
                            list.startIndex = idx;
                        }
                        this.renderGridItems(wheelscroll);
                    }
                }
            }
        },

        getItemsLength: function () {
            try {
                return this.lists[this.listActiveIndex].items.length;
            }
            catch (e) {
                return 0;
            }
        },

        onItemFocus: function ($el) {

        },

        focus: function () {
            var el;

            if (this.lists && this.lists.length) {
                el = this.el.find('li[data-list="' + this.listActiveIndex + '"]').eq(0);

                if (el.hasClass('emptylist')) {
                    do {
                        if (this.listActiveIndex + 1 < this.lists.length) {
                            this.listActiveIndex++;
                        }
                        else {
                            break;
                        }
                    }
                    while ((el = this.el.find('li[data-list="' + this.listActiveIndex + '"]').eq(0)) && el.hasClass('emptylist') && this.listActiveIndex < this.lists.length)
                }

                if (el.length == 0) {
                    el = this.el.find('li[data-list]').eq(0);

                    el.addClass('active-row');
                    el = el.find('.items li').eq(0);

                } else {
                    el.addClass('active-row');
                    el = el.find('.items li[data-index="' + this.lists[this.listActiveIndex].index + '"]').eq(0);

                    if (!el.hasClass('focusable')) {
                        el = el.prev();
                    }
                }

                if (el.length == 0) {
                    return false;
                }

                Focus.to(el);

                return true;
            }

            return false;

        },

        navigate: function (direction) {

            if (direction == 'up') {

                if (this.overlay.is(':visible')) {
                    return;
                }

                // if snippet is rendered as grid view then go up when is in first row otherwise if it is in first line
                if ((this.gridView && (this.lists[this.listActiveIndex].index < this.itemsPerRow)) || (!this.gridView && (this.listActiveIndex <= 0))) {
                    // focus needs to be shifted to top
                     App.navigation.focus();
                    return;
                }

                if (this.gridView) {
                    return this.movieListIndex(this.itemsPerRow * -1);
                }

            } else if (direction == 'down') {

                if (this.overlay.is(':visible')) {
                    return;
                }
                if (this.gridView) {
                    return this.movieListIndex(this.itemsPerRow);
                }

            } else if (direction == 'left') {

                if (this.overlay.is(':visible')) {
                    return;
                }
                var row, el;

                if ((this.gridView ? this.movieListIndex(-1) === false : this.onLeftRightKeyNav(-1) === false)) {
                    row = this.el.find('[data-list="' + this.listActiveIndex + '"]');
                    el = row.find('.list-toggle-grid');
                    if (el.length) {
                        row.removeClass('active-row');
                        setTimeout(function () {
                            Focus.to(el);
                        }, 10);
                    }
                }

            } else if (direction == 'right') {

                if (this.overlay.is(':visible')) {
                    return;
                }

                var row, el;
                if ((this.gridView ? this.movieListIndex(1) === false : this.onLeftRightKeyNav(1) === false)) {
                    row = this.el.find('[data-list="' + this.listActiveIndex + '"]');
                    el = row.find('.list-toggle-grid');
                    if (el.length) {
                        row.removeClass('active-row');
                        setTimeout(function () {
                            Focus.to(el);
                        }, 10);
                    }
                }
            }
        },

        onClick: function ($el, event) {

        },

        onEnter: function ($el, event) {

        },

        onFocus: function ($el) {

        },

        pagination: function () {

        }


    });

    return Snippet_Coverlist;

})(Snippet);