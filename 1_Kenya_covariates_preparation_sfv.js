////////////////////////////////////////////////////////////////////////////////
/* 
Covariates preparation for Kenya 
Authors: Yuri Gelsleichter
May 2025
*/
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// Clip images are unecessary and should be avoided, or done ate end of script, references: 
// https://developers.google.com/earth-engine/guides/best_practices?hl=en#if-you-dont-need-to-clip,-dont-use-clip
// https://courses.spatialthoughts.com/end-to-end-gee.html (item 07)
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
/// NASADEM: NASA NASADEM Digital Elevation 30m :: https://developers.google.com/earth-engine/datasets/catalog/NASA_NASADEM_HGT_001
////////////////////////////////////////////////////////////////////////////////
var dem = ee.Image('NASA/NASADEM_HGT/001').select('elevation').rename('dem');

// Get scale from DEM (30.922080775909325 m) 
var dem_scale = dem.projection().nominalScale();
print('DEM resolution (before mosaic)', dem_scale); 

// Get projection, the default projection is WGS84 with 1-degree scale 
var dem_crs = dem.projection();
// Check projection 
print('DEM crs', dem_crs);

// Derive slope, units in degrees, range is [0 to 90].
var slope = ee.Terrain.slope(dem).rename('slope');

// Derive aspect, units in degrees where 0=N, 90=E, 180=S, 270=W.
var aspect = ee.Terrain.aspect(dem).rename('aspect');

// Derive hillshade from a DEM :: https://gis.stackexchange.com/questions/445241/hillshade-image-blend-that-is-not-washed-out-earth-engine
var hillshade = ee.Terrain.hillshade({
  input: dem, 
  azimuth: 270, // The illumination azimuth in degrees from north, default: 270
  elevation: 45 // The illumination elevation in degrees, default: 45
}).rename('hillshade');

// Add to the map area
Map.addLayer(slope, {min: 0, max: 89.99}, 'Slope', false);
Map.addLayer(aspect, {min: 0, max: 359.99}, 'Aspect', false);
Map.addLayer(hillshade, {min: 0, max: 255}, 'Hillshade', false);

var elevationVis = {
  min: 0.0,
  max: 2500.0,
  palette: ['0000ff','00ffff','ffff00','ff0000','ffffff'],
};
Map.addLayer(dem, elevationVis, 'DEM', false);

// zoom and location of map area
Map.setCenter({lon:37.8, lat:-0.10, zoom:8}); 

//////////////////////////////////////////////////////////////// TPI 
//// Global ALOS mTPI (Multi-Scale Topographic Position Index) :: https://developers.google.com/earth-engine/datasets/catalog/CSP_ERGo_1_0_Global_ALOS_mTPI 
var tpi_im = ee.Image('CSP/ERGo/1_0/Global/ALOS_mTPI').select('AVE').rename('tpi');

// Resampling from 270 t0 30 m
var tpi = tpi_im.resample('bilinear')        // bilinear is better to avoid artifactis, bicubic is better but can introduce artifacts 
                          .reproject({
                            crs: dem_crs,    // EPSG:4326
                            scale: dem_scale // 30 m
                          });

// Check resolution 
print('TPI resolution', tpi.projection().nominalScale()); 

//////////////////////////////////////////////////////////////// CHILI
/// Global ALOS CHILI (Continuous Heat-Insolation Load Index) :: https://developers.google.com/earth-engine/datasets/catalog/CSP_ERGo_1_0_Global_ALOS_CHILI
// https://www.csp-inc.org/
// https://mw1.google.com/ges/dd/images/CSP_ERGo_CHILI_sample.png
var chili = ee.Image('CSP/ERGo/1_0/Global/ALOS_CHILI').select('constant').rename('chili');

// Resampling from 90 t0 30 m
chili = chili.resample('bilinear')
                          .reproject({
                            crs: dem_crs,
                            scale: dem_scale
                          });

// Check resolution
print('chili resolution', chili.projection().nominalScale()); 

//////////////////////////////////////////////////////////////// Landforms
/// Global ALOS Landforms :: https://developers.google.com/earth-engine/datasets/catalog/CSP_ERGo_1_0_Global_ALOS_landforms
var landform = ee.Image('CSP/ERGo/1_0/Global/ALOS_landforms').rename('landform');

// Resampling from 90 t0 30 m
landform = landform.resample('bilinear')
                          .reproject({
                            crs: dem_crs,
                            scale: dem_scale
                          });

// Check resolution
print('landform resolution', landform.projection().nominalScale()); 

//////////////////////////////////////////////////////////////// topo_diver
/// Global ALOS Topographic Diversity :: https://developers.google.com/earth-engine/datasets/catalog/CSP_ERGo_1_0_Global_ALOS_topoDiversity
var topo_diver = ee.Image('CSP/ERGo/1_0/Global/ALOS_topoDiversity').rename('topo_diver');

// Resampling from 270 t0 30 m
topo_diver = topo_diver.resample('bilinear')
                          .reproject({
                            crs: dem_crs,
                            scale: dem_scale
                          });

// Check resolution
print('topo_diver resolution', topo_diver.projection().nominalScale()); 


//////////////////////////////////////////////////////////////// 
/// MERIT Hydro: Global Hydrography Datasets :: https://developers.google.com/earth-engine/datasets/catalog/MERIT_Hydro_v1_0_1/
// Flow Direction (Local Drainage Direction)
var flow_dir = ee.Image('MERIT/Hydro/v1_0_1').select('dir').rename('flow_dir');

// Resampling from 90 t0 30 m
flow_dir = flow_dir.resample('bilinear')
                          .reproject({
                            crs: dem_crs,
                            scale: dem_scale
                          });

// Check resolution
print('flow_dir resolution', flow_dir.projection().nominalScale()); 

var flow_accumul = ee.Image('MERIT/Hydro/v1_0_1').select('upa').rename('flow_accumul');
// Upstream drainage area (flow accumulation area)
// Resampling from 90 t0 30 m
flow_accumul = flow_accumul.resample('bilinear')
                          .reproject({
                            crs: dem_crs,
                            scale: dem_scale
                          });

// Check resolution
print('flow_accumul resolution', flow_accumul.projection().nominalScale()); 

var river_chann_width = ee.Image('MERIT/Hydro/v1_0_1').select('viswth').rename('river_chann_width');
// Visualization of the river channel width
// Resampling from 90 t0 30 m
river_chann_width = river_chann_width.resample('bilinear')
                          .reproject({
                            crs: dem_crs,
                            scale: dem_scale
                          });

// Check resolution
print('River channel width resolution', river_chann_width.projection().nominalScale()); 

////////////////////////////////////////////////////////////////////////////////
/// ESA WorldCover 10m v200 :: https://developers.google.com/earth-engine/datasets/catalog/ESA_WorldCover_v200
////////////////////////////////////////////////////////////////////////////////
var landcover = ee.ImageCollection('ESA/WorldCover/v200').first().rename('landcover');

// Agregate from 10 to 30 m
landcover = landcover.reduceResolution({
  reducer: ee.Reducer.mean(),
  bestEffort: false // true: attempts to perform the operation as efficiently as possible, even if it means not including all pixels 
}).reproject({
  crs: dem_crs,
  scale: dem_scale
});

// Check resolution
print('landcover resolution', landcover.projection().nominalScale()); 

////////////////////////////////////////////////////////////////////////////////
/// Climate data
////////////////////////////////////////////////////////////////////////////////
// Load the WorldClim Climatology V1 - temperature and preciptation
// https://developers.google.com/earth-engine/datasets/catalog/WORLDCLIM_V1_MONTHLY
var clim = ee.ImageCollection('WORLDCLIM/V1/MONTHLY');

// Select temp_avg from clim
var temp_avg = clim.select('tavg').first().multiply(0.1).rename('temp_avg'); 

// Resampling from 1000 t0 30 m
temp_avg = temp_avg.resample('bilinear')
                          .reproject({
                            crs: dem_crs,
                            scale: dem_scale
                          });

// Check resolution
print('temp_avg resolution', temp_avg.projection().nominalScale()); 

// Select prec from clim
var preciptation = clim.select('prec').first().rename('preciptation'); 

// Resampling from 1000 t0 30 m
preciptation = preciptation.resample('bilinear')
                          .reproject({
                            crs: dem_crs,
                            scale: dem_scale
                          });

// Check resolution
print('Preciptation resolution', preciptation.projection().nominalScale()); 

/////////////////////////////////////////////////////////////// 
// Load the Landsat 8 image collection 2014-01-01', '2016-12-31
// https://developers.google.com/earth-engine/datasets/catalog/LANDSAT_LC08_C02_T1_L2 
var Landsat = ee.ImageCollection('LANDSAT/LC09/C02/T1_L2') // For Landsat 9 see: https://developers.google.com/earth-engine/datasets/catalog/LANDSAT_LC09_C02_T1_L2
//var Landsat = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2') // get the image collection 
    // .filterDate('2014-01-01', '2023-12-31')  // Adjust the year interval (done below in calendar range)
    .filter(ee.Filter.lte('CLOUD_COVER', 0.1));  // Filter cloud by percent 

// Get scale from Landsat (30 m) 
var Landsat_scale = Landsat.first().projection().nominalScale();
print('Landsat resolution (before mosaic)', Landsat_scale); 
 
// Apply scale factors (to make image with reflectance values and temperature for thermal images)
function applyScaleFactors(image) {
  var opticalBands = image.select('SR_B.').multiply(0.0000275).add(-0.2);
  var thermalBands = image.select('ST_B.*').multiply(0.00341802).add(149.0);
  return image.addBands(opticalBands, null, true)
              .addBands(thermalBands, null, true);
}

Landsat = Landsat.map(applyScaleFactors);

// Select only the necessary bands 
Landsat = Landsat.select(['SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B6', 'SR_B7']); 

// reduce image collection with median()
Landsat = Landsat.median();

Landsat = Landsat.setDefaultProjection(Landsat.projection());

var Landsat_scale = Landsat.projection().nominalScale();

// Check Landsat
print("See landsat details", Landsat);

// Compute the Normalized Difference Vegetation Index (NDVI).
// ((NIR - RED) / (NIR + RED + L))
var red = Landsat.select('SR_B4');
var nir = Landsat.select('SR_B5');
var ndvi = nir.subtract(red).divide(nir.add(red)).rename('ndvi');

// Compute the Soil Adjusted Vegetation Index (SAVI)
// In Landsat 8-9:  
// SAVI = ((Band 5 – Band 4) / (Band 5 + Band 4 + 0.5)) * (1.5). :: https://www.usgs.gov/landsat-missions/landsat-soil-adjusted-vegetation-index
// Compute the Soil Adjusted Vegetation Index (SAVI)
var savi = Landsat.expression(
    '1.5*((NIR-RED)/(NIR+RED+0.5))',{
        'NIR':Landsat.select('SR_B4'),
        'RED':Landsat.select('SR_B5')
    }).rename('savi');


////////////////////////////////////////////////////////////////////////////////////
/// bbox, area to clip the rasterrs 
////////////////////////////////////////////////////////////////////////////////////
// var bbox = ee.FeatureCollection("users/gelsleichter/bbox_shp_buff_2km"); // imported shapefile
var bbox = 
    ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Polygon(
              // 37.4766284489175, 37.9742531977015, -0.414203576514559, 0.149703611164146
              // (xmin, xmax, ymin, ymax)
              [[[37.4766284489175, 0.149703611164146], 
              [37.4766284489175, -0.414203576514559],
              [37.9742531977015, -0.414203576514559],
              [37.9742531977015, 0.149703611164146]]], null, false), 
            {"system:index": "0"})]);

// Add to the map area
// Landsat 9
var visualization = {
  bands: ['SR_B4', 'SR_B3', 'SR_B2'],
  min: 0.0,
  max: 0.3,
};
Map.addLayer(Landsat, visualization, 'True Color (432) Mosaic', false);
//savi
var saviVis = {'min':-1, 'max':1, 'palette':['red', 'yellow', 'green']};
Map.addLayer(savi, saviVis, 'SAVI', false);
// ndvi
var ndviParams = {min: -1, max: 1, palette: ['blue', 'white', 'green']};
Map.addLayer(ndvi, ndviParams, 'NDVI', false);
// bbox
Map.addLayer(bbox, {color: 'blue'}, 'bbox Kenya study area', true, 0.5);

// Map area background options
// Map.setOptions('HYBRID');
// Map.setOptions('ROADMAP');
// Map.setOptions('SATELLITE');
Map.setOptions('TERRAIN');

///////////////////////////////////////////// 
// Stack images to one assets 
var predictors = dem.addBands(slope)
                    .addBands(aspect)
                    //.addBands(hillshade) // for visualization only
                    .addBands(tpi)
                    .addBands(chili)
                    .addBands(landform)
                    .addBands(topo_diver)
                    .addBands(flow_dir)
                    .addBands(flow_accumul)
                    //.addBands(river_chann_width) // for Mount Kenya is not relavant
                    .addBands(landcover)
                    .addBands(temp_avg)
                    .addBands(preciptation)
                    .addBands(Landsat)
                    .addBands(ndvi)
                    .addBands(savi)
                    ;

// clip for shapefile
var predictors_bbox = predictors.clip(bbox);
print('Check Predictors_bbox', predictors_bbox);

// Convert all to Float (to same datatype, to avoid errors)  
predictors_bbox = predictors_bbox.toFloat(); 

/////////////////////////////////////////////////////////////////////////////////////////
/// Export a Cloud Optimized GeoTIFF (COG) by setting the "cloudOptimized"
/////////////////////////////////////////////////////////////////////////////////////////

// Export to your google drive
Export.image.toDrive({
 image: predictors_bbox,
 description: 'Covariates_Kenya_to_drive',
 folder: 'earth_engine_Kenya',
 region: bbox,
 scale: 30,
 crs: 'EPSG:4326',
 formatOptions: {
   cloudOptimized: true
 }
});

// Export to asset
// Get the user and build the export path
var userRoot = ee.data.getAssetRoots()[0].id; // e.g., users/gelsleichter
var asset_id = userRoot + '/predictors_m_kenya_epsg_4326'; // build like: 'users/gelsleichter/predictors_m_kenya_epsg_4326'
Export.image.toAsset({
  image: predictors_bbox,
  description: 'Covariates_Kenya_to_assets',
  assetId: asset_id,
  region: bbox,
  scale: 30,
  crs: 'EPSG:4326',
  maxPixels: 1e13
});

// CHeck Asset ID
print('Asset ID', asset_id);

/*
End script
*/
