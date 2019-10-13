'use strict';

( function( name, root, factory ) {
    if ( typeof define === 'function' && define.amd ) {
        // AMD. Register as an anonymous module.
        define( [], factory );
    } else if ( typeof module === 'object' && module.exports ) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else if (typeof exports === 'object') {
        exports[name] = factory();
    } else {
        root[name] = factory();
    }
}( 'DarkSky', this, function() {

    /* 	By Ian Tearle
    	github.com/iantearle

    	Other contributors
    	Richard Bultitude
    	github.com/rjbultitude
    	Brandon Love
    	github.com/brandonlove
    */

    //Error strings
    var darkSkyServiceError = 'There was a problem accessing darksky.net. Make sure you have a valid key';

    //Forecast Class
    /**
     * Will construct a new DarkSky object
     *
     * @param string $config
     * @return boolean
     */
    function DarkSky( config ) {
        if ( !config ) {
            console.log( 'You must pass DarkSky configurations' );
        }
        if ( !config.PROXY_SCRIPT ) {
            if ( !config.API_KEY ) {
                console.log( 'API_KEY or PROXY_SCRIPT must be set in DarkSky config' );
            }
        }

        function validURL(urlString) {
            return urlString.test(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/);
        }

        function getAPIUrl() {
            if (typeof config.PROXY_SCRIPT !== 'undefined') {
                if (validURL(config.PROXY_SCRIPT)) {
                    throw new Error('No valid URL from proxy. Check the server is running');
                }
                return config.PROXY_SCRIPT + '?url=';
            } else if (config.API_KEY) {
                return 'https://api.darksky.net/forecast/' + config.API_KEY + '/';
            } else {
                throw new Error('No valid darkskyp API URL from host app or proxy');
            }
        }
        this.API_KEY = config.API_KEY;
        this.url = getAPIUrl();
    }

    DarkSky.prototype.makeRequest = function makeRequest( method, url ) {
        return new Promise( function( resolve, reject ) {
            var xhr = new XMLHttpRequest();
            xhr.open( method, url );
            xhr.onload = function() {
                if ( this.status >= 200 && this.status < 300 ) {
                    resolve( xhr.response );
                } else {
                    reject( {
                        status: this.status,
                        statusText: xhr.statusText
                    } );
                }
            };
            xhr.onerror = function() {
                reject( {
                    status: this.status,
                    statusText: xhr.statusText
                } );
            };
            xhr.send();
        } );
    }

    /**
     * Checks the location object
     * passed into the app
     * and wraps it in an array
     * if it wasn't one already
     *
     * @param object $locObject
     * @return array
     */
    DarkSky.prototype.checkObject = function checkObject( locObject ) {
        var locationsObjWrap = [];
        if ( !Array.isArray( locObject ) ) {
            locationsObjWrap.push( locObject );
            return locationsObjWrap;
        } else {
            return locObject;
        }
    }

    DarkSky.prototype.getURL = function getURL( latitude, longitude ) {
        return this.url + latitude + ',' + longitude;
    }

    /**
     * Will build a url string from the lat long coords
     * and return a promise with the json
     *
     * @param number $latitude
     * @param number $longitude
     * @return promise object
     */
    DarkSky.prototype.requestData = function requestData( latitude, longitude ) {
        var requestUrl = this.getURL(latitude, longitude);
        return this.makeRequest( 'GET', requestUrl );
    };

    DarkSky.prototype.requestAllLocData = function requestAllLocData( locations ) {
        var locDataArr = [];
        for ( var i = 0, length = locations.length; i < length; i++ ) {
            var content = this.requestData( locations[ i ].latitude, locations[ i ].longitude );
            locDataArr.push( content );
        }
        return locDataArr;
    };

    DarkSky.prototype.getValidLocdata = function getValidLocdata(locations) {
        var locationsArr = this.checkObject( locations );
        return this.requestAllLocData( locationsArr );
    }

    DarkSky.prototype.processCurrent = function processCurrent(parsedData, locations, i) {
        return new DarkSkyConditions( parsedData.currently, locations[ i ].name );
    }

    DarkSky.prototype.processData = function processData(forecasts, locations, fnKey, appCallback) {
        if (typeof fnKey !== 'string') {
            console.warn('method key must be a string');
            return false;
        }
        var dataSets = [];
        var dataTypeFn = this[fnKey];
        for ( var i = 0, length = forecasts.length; i < length; i++ ) {
            var parsedData = JSON.parse( forecasts[i] );
            // handle data types via fnKey
            dataSets.push(dataTypeFn(parsedData, locations, i));
        }
        // Pass data to callback
        appCallback( dataSets );
        return dataSets;
    }

    DarkSky.prototype.checkData = function checkData( forecasts, locations, dataType, appCallback ) {
        if (!forecasts || !forecasts[0]) {
            console.warn( darkSkyServiceError );
            return false;
        }
        this.processData(forecasts, locations, dataType, appCallback);
        return true;
    }

    DarkSky.prototype.initAllReqs = function initAllReqs(locations, dataType, appCallback) {
        var validLocData = this.getValidLocdata( locations );
        var thisDarkSky = this;
        return Promise.all( validLocData ).then( function( forecasts ) {
            thisDarkSky.checkData(forecasts, locations, dataType, appCallback); 
        }, function( rejectObj ) {
            console.warn( rejectObj.status );
            console.warn( rejectObj.statusText );
        }).catch(function(e) {
            console.warn(e);
        });
    }

    /**
     * Will take a locations object and a callback function
     * and pass the current conditions into the callback
     *
     * @param object $locations
     * @param function $appCallback
     * @return boolean
     */
    DarkSky.prototype.getCurrentConditions = function getCurrentConditions( locations, appCallback ) {
        this.initAllReqs(locations, 'processCurrent', appCallback);
    };

    function DarkSkyConditions( rawData, name ) {
        DarkSkyConditions.prototype = {
            rawData: rawData
        };
        this.name = name || 'no name provided';
        /**
         * Will return the temperature
         *
         * @return String
         */
        this.temperature = function() {
            return rawData.temperature;
        };
        /**
         * Will return the apparent temperature
         *
         * @return String
         */
        this.apparentTemperature = function() {
            return rawData.apparentTemperature;
        };
        /**
         * Get the summary of the conditions
         *
         * @return String
         */
        this.summary = function() {
            return rawData.summary;
        };
        /**
         * Get the icon of the conditions
         *
         * @return String
         */
        this.icon = function() {
            return rawData.icon;
        };
        /**
         * Get the pressure
         *
         * @return String
         */
        this.pressure = function() {
            return rawData.pressure;
        };
        /**
         * get humidity
         *
         * @return String
         */
        this.humidity = function() {
            return rawData.humidity;
        };
        /**
         * Get the wind speed
         *
         * @return String
         */
        this.windSpeed = function() {
            return rawData.windSpeed;
        };
        /**
         * Get wind direction
         *
         * @return type
         */
        this.windBearing = function() {
            return rawData.windBearing;
        };
        /**
         * get precipitation type
         *
         * @return type
         */
        this.precipType = function() {
            return rawData.precipType;
        };
        /**
         * get the probability 0..1 of precipitation type
         *
         * @return type
         */
        this.precipProbability = function() {
            return rawData.precipProbability;
        };
        /**
         * Get the cloud cover
         *
         * @return type
         */
        this.cloudCover = function() {
            return rawData.cloudCover;
        };
        /**
         * get the min temperature
         * only available for week (daily)
         *
         * @return type
         */
        this.temperatureMin = function() {
            return rawData.temperatureMin;
        };
        /**
         * get the min temperature time
         * only available for week (daily)
         *
         * @return type
         */
        this.temperatureMinTime = function() {
            return rawData.temperatureMinTime;
        };
        /**
         * get max temperature
         * only available for week (daily)
         *
         * @return type
         */
        this.temperatureMax = function() {
            return rawData.temperatureMax;
        };
        /**
         * get max temperature time
         * only available for week (daily)
         *
         * @return type
         */
        this.temperatureMaxTime = function() {
            return rawData.temperatureMaxTime;
        };
        /**
         * get moon phase
         *
         * only available for week forecast
         *
         * @return type
         */
        this.moonPhase = function() {
            return rawData.moonPhase;
        };
        /**
         * get precipitation intensity
         *
         * @return number
         */
        this.precipIntensity = function() {
            return rawData.precipIntensity;
        };
        /**
         * get dew point
         *
         * @return number
         */
        this.dewPoint = function() {
            return rawData.dewPoint;
        };
        /**
         * get the ozone
         *
         * @return number
         */
        this.ozone = function() {
            return rawData.ozone;
        };
        /**
         * get the visibility
         *
         * @return number
         */
        this.visibility = function() {
            return rawData.visibility;
        };
        /**
         * get the nearest storm bearing
         * only available on current
         *
         * @return number
         */
        this.nearestStormBearing = function() {
            return rawData.nearestStormBearing;
        };
        /**
         * get the nearest storm distance
         * only available on current
         *
         * @return number
         */
        this.nearestStormDistance = function() {
            return rawData.nearestStormDistance;
        };
        /**
         * get the uvIndex
         *
         * @return number
         */
        this.uvIndex = function() {
            return rawData.uvIndex;
        };
        /**
         * get the windGust
         *
         * @return number
         */
        this.windGust = function() {
            return rawData.windGust;
        };
    }

    return DarkSky;
} ) );
