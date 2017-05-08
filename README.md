# darkSkyjs


A javascript api for darksky.net

---

## Features

This package is designed to provide :

* A simple API for making multiple simultaneous requests
* A promised-based request that only returns data when all requests are successful
* A callback that outputs the data
* Valid current, daily and weekly weather data

It differs from the [original library](https://github.com/iantearle/darksky.net-javascript-api) in three ways:

* It only accepts an returns arrays of locations / weather conditions - This is a breaking change
* Each _get_ function's name matches the property name of what the DarkSky service returns
* Recently added date points have been included. They are: `nearestStormDistance` and `nearestStormBearing`


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

You can then use one of the three methods listed below to retrieve location specific weather data.

* `getCurrentConditions`
* `getForecastToday`
* `getForecastWeek`

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

*darkskyjs* can handle multiple location requests. Each request must comprise of two _latitude_ _longitude_ coordinates. Optionally you can pass in a place name as a reference which will be returned should the request be successful e.g.

```
[{latitude: 51.507351, longitude: -0.127758, name: 'London'}]
```

If you don't pass an array it will create one for you, but it's best to do so for consistency and to avoid confusion as an array is what you'll get back.

## Returned data

`getCurrentConditions`, `getForecastToday` and `getForecastWeek` return nested arrays for each supplied location. In order to match the locations that were supplied with what's returned it is recommended that the `name` property be used. A callback is then used to supply the returned data.

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

DarkSkyJS uses
[moment.js](http://momentjs.com/) to handle date/time data and
[ES6 Promises Polyfill](https://github.com/jakearchibald/es6-promise) to handle the requests via promises

Ref: [https://www.npmjs.com/package/moment](https://www.npmjs.com/package/moment)
Ref: [https://www.npmjs.com/package/es6-promise](https://www.npmjs.com/package/es6-promise)
