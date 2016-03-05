/**
 * Created by rkdroid on 3/4/16.
 */


TmdbApi = $.extend(true, {

    apiUrl: 'https://api.themoviedb.org/3/',
    imageUrl: 'http://image.tmdb.org/t/p/w370',
    apikey: 'fb5a22ba28e3a8b761c623cb071fa7a9',


    requestApi: function (url, data, requestType, callback, cbscope, notlogged) {

        if (typeof requestType == 'function') {
            notlogged = cbscope;
            cbscope = callback;
            callback = requestType;
            requestType = 'GET';
        }
        var scope = this;
        var dataArr = [];

        if (requestType == 'GET') {
            data.api_key = this.apikey;
        }
        for (var i in data) {
            if (data.hasOwnProperty(i)) {
                if (typeof data[i] == 'object' || (data[i] instanceof Array)) {
                    for (var j in data[i]) {
                        dataArr.push(i + '=' + data[i][j]);
                    }

                } else {
                    dataArr.push(i + '=' + data[i]);
                }
            }
        }

        url = this.apiUrl.replace(/\{version\}/, this.apiVersion) + url;

        $.ajax({
            url: url,
            type: requestType,
            data: dataArr.join('&'),
            dataType: 'json',
            processData: false,
            timeout: scope.requestTimeout,
            beforeSend: function (xhr) {
                if (scope.access_token) {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + scope.access_token);
                }
            },
            success: function (resp, status, xhr) {
                if (callback) {
                    callback.call(cbscope || scope, resp || null, status, xhr, url);
                }
            },
            error: function (xhr, status, err) {
                try {
                    var resp = xhr.responseText;

                    if (resp) {
                        resp = resp.substring(0, 60) + (resp.length > 60 ? '...' : '');
                    }

                    if (xhr.statusText === 'error' && xhr.status === 0 && !resp) {
                        resp = 'Connection refused';
                    }

                    if (err === 'timeout') {
                        scope.trigger('timeout');
                    }

                    if (notlogged && notlogged.indexOf(xhr.status) >= 0) {
                        // ignore trigger
                    }
                    else {
                        scope.trigger('api.error', xhr.status, url + (requestType == 'POST' ? '' : '?' + dataArr.join('&')), +JSON.stringify(xhr.responseText));
                    }

                    if (!resp && ((xhr.status == 401 && xhr.statusText.toUpperCase() == 'UNAUTHORIZED') || (resp.error && resp.error.toUpperCase() == '401 UNAUTHORIZED'))) {
                        scope.trigger('api.user.reset');
                        window.setTimeout(function () {
                            scope.trigger('api.notify', __('user_identity_fail'));
                        }, 2000);
                    }

                    if (callback) {
                        callback.call(cbscope || scope, false, xhr.status, xhr, err, url);
                    }
                }
                catch (e) {
                    resp = 'Connection refused';
                    console.network(uid, 'error', '>>> ' + status.toUpperCase() + ' [' + '-1' + ' ' + 'NETWORK FAILED' + '] ' + resp);
                    if (callback) {
                        callback.call(cbscope || scope, false, -1, xhr ? xhr : 'XXX', err, url);
                    }
                }
            }
        });

    },

    request: function (url, data, type, callback, cbscope, header, notlogged) {
        if (typeof type == 'function') {
            cbscope = callback
            callback = type
            type = 'GET'
        }

        var scope = this;
        var dataArr = [];

        for (var i in data) {
            if (data.hasOwnProperty(i)) {
                if (typeof data[i] == 'object' || (data[i] instanceof Array)) {
                    for (var j in data[i]) {
                        dataArr.push(i + '=' + data[i][j]);
                    }

                } else {
                    dataArr.push(i + '=' + data[i]);
                }
            }
        }

        console.log(dataArr.join('&'));

        $.ajax({
            url: url,
            type: type,
            data: dataArr.join('&'),
            dataType: 'json',
            processData: false,
            timeout: scope.requestTimeout,
            beforeSend: function (xhr) {
                if (header) {
                    for (var key in header) {
                        if (header.hasOwnProperty(key)) {
                            xhr.setRequestHeader(key, header[key]);
                        }
                    }
                }
            },

            success: function (resp, status, xhr) {
                console.network(uid, status);
                if (resp && resp.isException && (resp.responseCode == 403 || resp.responseCode == 401)) {
                    scope.setAccessToken(null, null);

                    if (resp.responseCode == 403 && (resp.exception == 'GeoLocationBlocked' || resp.exception == 'IpBlocked') && resp.description) {
                        scope.trigger('api.notify', resp.description);
                    }
                }

                if (callback) {
                    callback.call(cbscope || scope, resp || null, status, xhr, url);
                }
            },
            error: function (xhr, status, err) {
                try {
                    var resp = xhr.responseText;

                    if (resp) {
                        resp = resp.substring(0, 60) + (resp.length > 60 ? '...' : '');
                    }

                    if (xhr.statusText === 'error' && xhr.status === 0 && !resp) {
                        resp = 'Connection refused';
                    }
                    console.network(uid, 'error', '>>> ' + status.toUpperCase() + ' [' + xhr.status + ' ' + xhr.statusText + '] ' + resp);

                    if (notlogged && notlogged.indexOf(xhr.status) >= 0) {
                        // ignore trigger
                    }
                    else {
                        scope.trigger('api.error', xhr.status, url + (requestType == 'POST' ? '' : '?' + dataArr.join('&')), +JSON.stringify(xhr.responseText));
                    }

                    if (err === 'timeout') {
                        scope.trigger('timeout');
                    }

                    if (callback) {
                        callback.call(cbscope || scope, false, xhr.status, xhr, err, url, status, resp);
                    }
                }
                catch (e) {
                    resp = 'Connection refused';
                    console.network(uid, 'error', '>>> ' + status.toUpperCase() + ' [' + '-1' + ' ' + 'NETWORK FAILED' + '] ' + resp);
                    if (callback) {
                        callback.call(cbscope || scope, false, -1, xhr ? xhr : 'XXX', err, url, status, resp);
                    }
                }
            }
        });
    },

    getMoviesPopular: function (params, callback, cbscope) {
        this.requestApi('movie/popular', params, function (resp) {
            if (!resp) {
                if (callback) {
                    callback.call(cbscope || this, false);
                }
                return;
            }

            if (callback) {
                callback.apply(cbscope || this, arguments);
            }
        }, this);
    },

    getMoviesTopRated: function (params, callback, cbscope) {
        this.requestApi('movie/top_rated', params, function (resp) {
            if (!resp) {
                if (callback) {
                    callback.call(cbscope || this, false);
                }
                return;
            }

            if (callback) {
                callback.apply(cbscope || this, arguments);
            }
        }, this);
    },

    getMoviesUpcoming: function (params, callback, cbscope) {
        this.requestApi('movie/upcoming', params, function (resp) {
            if (!resp) {
                if (callback) {
                    callback.call(cbscope || this, false);
                }
                return;
            }

            if (callback) {
                callback.apply(cbscope || this, arguments);
            }
        }, this);
    },

    getMoviesNowPlaying: function (params, callback, cbscope) {
        this.requestApi('movie/now_playing', params, function (resp) {
            if (!resp) {
                if (callback) {
                    callback.call(cbscope || this, false);
                }
                return;
            }

            if (callback) {
                callback.apply(cbscope || this, arguments);
            }
        }, this);
    },

    getMovies: function(endPoint, params, callback, cbscope) {
        this.requestApi(endPoint, params, function (resp) {
            if (!resp) {
                if (callback) {
                    callback.call(cbscope || this, false);
                }
                return;
            }

            if (callback) {
                callback.apply(cbscope || this, arguments);
            }
        }, this);
    }

}, Events);