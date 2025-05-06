////////////////////////////////////////////////////////////////////////////////
/* 
Covariates preparation Mount Kenya 
Authors: Yuri Gelsleichter
May 2025
*/
////////////////////////////////////////////////////////////////////////////////


/*
Usefull links:

GEE datasets:
https://developers.google.com/earth-engine/datasets

GEE free course:
https://courses.spatialthoughts.com/end-to-end-gee.html
*/

/* Comment several lines
a
b
c
...
*/

// comment one line

/////////////////////////////////////////////////////////////////////////////////////////
/// How to load images
/////////////////////////////////////////////////////////////////////////////////////////
var dataset = ee.ImageCollection('USDA/NAIP/DOQQ')                     // dataset (Imagge collection) name
                  .filter(ee.Filter.date('2017-01-01', '2018-12-31')); // Date filter
var trueColor = dataset.select(['R', 'G', 'B']);                       // Band selection 

// Visualization parameters
var trueColorVis = {
  min: 0,
  max: 255,
};

// Add image to map area
Map.addLayer(trueColor, trueColorVis, 'True Color', true);

// Defini location and zoom of vizualization
Map.setCenter(-100.85, 41.08, 17);


/////////////////////////////////////////////////////////////////////////////////////////
/// Define Area of Interest AOI and clip
/////////////////////////////////////////////////////////////////////////////////////////
var falseColor = dataset.select(['N', 'R', 'G']);
var bbox = 
    ee.Geometry.Polygon(
        [[[-100.85803589820861, 41.0871811473829],
          [-100.85803589820861, 41.068547357944944],
          [-100.83365998268127, 41.068547357944944],
          [-100.83365998268127, 41.0871811473829]]], null, false);

Map.addLayer(falseColor.median().clip(bbox), trueColorVis, 'False Color clip', false);



/* Comment (to move: alt+up/down)

/////////////////////////////////////////////////////////////////////////////////////////
/// Vegetation index - NDVI
/////////////////////////////////////////////////////////////////////////////////////////

// NDVI = (NIR-Red) / (NIR+Red)

var nir = dataset.select('N').median();
var red = dataset.select('R').median();
var ndvi = nir.subtract(red).divide(nir.add(red)).rename('NDVI');

// Visualize params
var ndviPalette = ['#d73027', '#f46d43', '#fdae61', '#fee08b', '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850'];
Map.addLayer(ndvi.clip(bbox), {min: -1, max: 1, palette: ndviPalette}, 'NDVI', false);

////////////////////////////////////////////////////////////////////////////////
/// Load image
////////////////////////////////////////////////////////////////////////////////
var dem = ee.Image('NASA/NASADEM_HGT/001').select('elevation').rename('dem');

*/
