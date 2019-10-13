# darkSkyjs-lite

A javascript api for darksky.net

[![Build Status](https://travis-ci.org/rjbultitude/darkskyjs.svg?branch=master)](https://travis-ci.org/rjbultitude/darkskyjs)

---

## Special notice

This is a smaller version of [DarkSkyJS](https://github.com/rjbultitude/darkskyjs) that only deals with current (the `currently` endpoint) weather conditions, rather than the `hourly` and `daily` ones. 

The purpose of this version is to reduce the file size of the library and remove the dependencies, specifically:
 * [Moment.JS](https://momentjs.com/), which could be considered quite large in proportion to the number of its features that are used
 * [Promise polyfill](https://github.com/jakearchibald/es6-promise), which is now supported in most browsers with the exception of IE11 and Opera Mini.

## Features

This package is designed to provide:

* A simple API for making multiple simultaneous requests
* A promised-based request that only returns data when all requests are successful
* A callback that outputs the data

It differs from the original library in three ways:

* It only accepts, and returns, arrays of locations/conditions - this is a breaking change
* Each get function's name matches the property name of what the DarkSky service returns
* Missing data points have been included, see Recent Updates seciton below:


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

The following data points were added when first published on NPM

* nearestStormDistance
* nearestStormBearing

## Getting Started

If you haven't already, create a developer account here [https://darksky.net/dev/](https://darksky.net/dev/).

It is recommended you install via [NPM](https://npmjs.com) where dependencies will be loaded automatically.

`npm install darkskyjs`

darkskyjs is configured to work with both [AMD](https://en.wikipedia.org/wiki/Asynchronous_module_definition) and [CJS](https://en.wikipedia.org/wiki/CommonJS) applications.

If you're using [Webpack](http://webpack.github.io/), [Browserify](http://browserify.org/) or some other CJS module loader simply require the module like so

`var Darksky = require('darkskyjs');`

or using ES6 import, like so

`import Darksky from 'darkskyjs'`

and use the `Darksky` constructor like so:

`var darkSky = new DarkSky()`

You can then use the method listed below to retrieve location specific weather data.

* `getCurrentConditions`

If you're using [Require.JS](http://requirejs.org/) you will need to download [momentjs](https://momentjs.com/) and [es6-promise](https://github.com/stefanpenner/es6-promise).

A server side proxy is required for this to work. So create a file that will contain your key and be careful _not_ to commit it to a public code base.

Here's an example PHP one. Replace the value of $api_key with your valid key.

```
<?php
// File Name: proxy.php

$api_key = 'b962d5ee80be5293a234b69fb975629c';

$API_ENDPOINT = 'https://api.darksky.net/forecast/';
$url = $API_ENDPOINT . $api_key . '/';

if(!isset($_GET['url'])) die();
$url = $url . $_GET['url'];
$url = file_get_contents($url);

print_r($url);
```

## Location data

_darkskyjs_ can handle multiple location requests. Simply pass in an array of requests (to one of the three methods listed above) to get data for multiple locations. 

Each request must comprise of two key/value pairs: `latitude` and `longitude`. Optionally you can pass in a place name as a reference which will be returned should the request be successful e.g.
```
[{latitude: 51.507351, longitude: -0.127758, name: 'London'}]
```

If you don't pass an array it will create one for you, but it's best to do so for consistency and to avoid confusion as an array is what you'll get back.

## Returned data

This API returns a set of functions that allow you to access the raw data, rather then the raw data itself. Each function is named in exactly the same way as its respective data point e.g. `ozone()` will return the value for `ozone`.

`getCurrentConditions` returns an array of condition arrays. Each array represents one of locations you requested data for. 

In order to match the locations that were supplied with what's returned it is recommended that the `name` property be used. A callback is then used to supply the returned data. For example:

```
darkSky.getCurrentConditions(
  [
    // location object(s)
    {
      latitude: 51.507351,
      longitude: -0.127758,
      name: 'London'
    }
  ],
  // callback
  function(conditions) {
    for (var i = 0, length = conditions.length; i < length; i++) {
      if (conditions[i].name === 'London') {
        console.log(conditions[i].cloudCover());
      }
    }
  }
);
```

## Dependencies

This package has no dependencies

### Plans

Add a method for retrieving alerts