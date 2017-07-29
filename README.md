# darkSkyjs


A javascript api for darksky.net

---

## Features

This package is designed to provide :

* A simple API for making multiple simultaneous requests
* A promised-based request that only returns data when all requests are successful
* A callback that outputs the data
* Valid current, daily and weekly weather data

## Recent updates

The following data points have been added since 29/07/2017:

* moonPhase
* precipAccumulation
* apparentTemperatureMax
* apparentTemperatureMaxTime
* apparentTemperatureMin
* apparentTemperatureMinTime
* precipIntensityMax
* precipIntensityMaxTime
* temperatureMaxTime
* temperatureMinTime
* uvIndex
* uvIndexTime
* windGust
* windGustTime

## Getting Started

If you haven't already, create a developer account here [https://darksky.net/dev/](https://darksky.net/dev/).

A server side proxy is required for this to work. So create a file that will contain your key and be careful _not_ to commit it to a public code base.
Here's an example PHP one. Replace the value of $api_key with your valid key. 

```
<?php
// File Name: proxy.php

$api_key = 'b962d5ee80be5293a234b69fb975629c';

$API_ENDPOINT = 'https://api.forecast.io/forecast/';
$url = $API_ENDPOINT . $api_key . '/';

if(!isset($_GET['url'])) die();
$url = $url . $_GET['url'];
$url = file_get_contents($url);

print_r($url);
```

darkskyjs is configured to work with both [AMD](https://en.wikipedia.org/wiki/Asynchronous_module_definition) and [CJS](https://en.wikipedia.org/wiki/CommonJS) applications. When the module is loaded it will return a constructor that, once run, will provide the necessary interface functions, namely:

* `getCurrentConditions`
* `getForecastToday`
* `getForecastWeek`

Use of the above is demonstrated within index.html. 

If you're using [Require.JS](http://requirejs.org/) use the example configuration in index.html as a reference. 

If you're using [Webpack](http://webpack.github.io/), [Browserify](http://browserify.org/) or some other CJS module loader simply require the module like so

`var Darksky = require('darksky.net');`

and use the `Darksky` constructor like so:

`var darkSky = new DarkSky()`

## Location data

darkskyjs can handle multiple location requests. Each request must comprise of two lat long coordinates. Optionally you can pass in a place name as a reference which will be returned shiuld the request be successful.

Any request _must_ be supplied as an array of objects like so:

`darkSky.getCurrentConditions([{51.507351, -0.127758, 'London'}])`

## Returned data

This API returns a set of functions that allow you to access the raw data, rather then the raw data itself.

`getCurrentConditions` returns an array of condition arrays. Each array represents one of locations you requested data for. 

`getForecastToday` and `getForecastWeek` return nested arrays, one for each supplied location. Within that array is an array for each hour when using `getForecastToday` or one for each day when using `getForecastWeek`. 

## Dependencies

Forecast.io.js uses [moment.js](http://momentjs.com/) to handle date/time data and an [ES6 Promises Polyfill](https://github.com/jakearchibald/es6-promise) to handle the requests via promises.

If you're using Require.JS be sure to load include these two libraries somewhere in your application.

If you're using a CJS module loader dependencies are automatically installed when you run 

`npm i darkskynet-api -D`

or 

`yarn add darkskynet-api -D`

Ref: [https://www.npmjs.com/package/moment](https://www.npmjs.com/package/moment)
Ref: [https://www.npmjs.com/package/es6-promise](https://www.npmjs.com/package/es6-promise)

### Plans

Add methods for retrieving alerts

Reduce repetion in three current methods by currying