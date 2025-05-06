////////////////////////////////////////////////////////////////////////////////
/* 
Covariates preparation Mount Kenya 
Authors: Yuri Gelsleichter
May 2025
*/
////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////
/// Load assets
/////////////////////////////////////////////////////////////////////////////////////////
var predictors_all = ee.Image("projects/ee-geogelsleichter/assets/DSM_m_kenya_asset_folder/predictors_m_kenya_epsg_4326");

// Check in console 
print('Print predictors: all covariates names', predictors_all); 
print('Print predictors: all band names', predictors_all.bandNames()); 

// Selected covariates 
var bands_sel = [
                 'dem',
                 'slope',
                 'aspect',
                 'tpi',
                 'chili',
                 'landform',
                 'topo_diver',
                 'flow_dir',
                 'flow_accumul',
                 'landcover',
                 'temp_avg',
                 'preciptation',
                 //'SR_B2',
                 //'SR_B3',
                 //'SR_B4',
                 'SR_B5',
                 'SR_B6',
                 'SR_B7',
                 'ndvi',
                 'savi'
                 ];

// Select the bands to use
var predictors = predictors_all.select(bands_sel);

var bands = predictors.bandNames(); 

print('Print selected band names', bands);

/* Comment (to move: alt+up/down)

/////////////////////////////////////////////////////////////////////////////////////////
/// Load points_SOC as FeatureCollection 
/////////////////////////////////////////////////////////////////////////////////////////
var points_SOC = ee.FeatureCollection("projects/ee-geogelsleichter/assets/sample_points_mk_soc_0_20cm");

// Check in console 
print('Print points_SOC', points_SOC); 

// Zoom and locaiton of map area
Map.centerObject(points_SOC, 9); // object, zoom

// Define backgroung map area
// Map.setOptions('HYBRID');
// Map.setOptions('ROADMAP');
// Map.setOptions('SATELLITE');
Map.setOptions('TERRAIN');

// Add to map area 
// Covatiates (dem)
var elevationVis = {
  min: 0.0,
  max: 2500.0,
  palette: ['0000ff','00ffff','ffff00','ff0000','ffffff'],
};
Map.addLayer(predictors.select('dem'), elevationVis, 'DEM', true);

// Points
Map.addLayer(points_SOC, {color: 'magenta'}, 'SOC points', true);

// Define color palett
// Soil Organic Carbon (SOC) palette
var soil_palette_col = ['ffffe5', '662506']; // SOC

// Define min and max values for soil properties
var soil_prop_min = 0.5, soil_prop_max = 5.5; // SOC

var soilProperty = 'SOC', unity = '(%)'; 

/////////////////////////////////////////////////////////////////////////////////////////
// Sample the predictors to generate training data  
/////////////////////////////////////////////////////////////////////////////////////////

// The class label is stored in the 'SOC_cat' property 
var extracted_points = predictors.select(bands_sel).sampleRegions({ // https://developers.google.com/earth-engine/guides/classification#code-editor-javascript_2
  collection: points_SOC,
  properties: [soilProperty],   // 'SOC' is the property name in the training dataset column
  scale: 30,
  geometries: true              // this will keep the coordinates
});

print("extracted_points", extracted_points);


/////////////////////////////////////////////////////////////////////////////////////////
/// Split data for train, test
/// Official documentation for the split with seed: 
/// - https://developers.google.com/earth-engine/guides/classification#code-editor-javascript_2
/// - https://developers.google.com/earth-engine/apidocs/ee-classifier-smilegradienttreeboost
/////////////////////////////////////////////////////////////////////////////////////////

// Prepare accuracy assessment   
// Add a column of random uniforms to the extracted_poins dataset 
//var withRandom = extracted_points.randomColumn('random');
var seed = 836; // Seed for reproducibility 
var withRandom = extracted_points.randomColumn('random', seed);

// We want to reserve some of the data for testing, to avoid overfitting the model 
var split = 0.8;  // Roughly 70% training, 30% testing.
var trainingPartition = withRandom.filter(ee.Filter.lt('random', split)); // lt: less than
var testingPartition = withRandom.filter(ee.Filter.gte('random', split)); // gte: greater or equal than

// print("trainingPartition", trainingPartition);
// print("testingPartition", testingPartition);

Map.addLayer(trainingPartition, {color: 'blue'}, 'trainingPartition', true);
Map.addLayer(testingPartition, {color: 'green'}, 'testingPartition', true);


/////////////////////////////////////////////////////////////////////////////////////////
/// Train RF model 
/////////////////////////////////////////////////////////////////////////////////////////
// --- Paramenters for Random forest model 
var rf_params = {
  ntree: 500,       // Number of trees
  mtry: 7,          // Number of variables to possibly split at each leaf node
  nodesize: 5,      // Minimum size of terminal nodes
  sampsize: 0.65    // Fraction of the training dataset to sample for growing each tree
};
// --- Trainning the RF model with 70% of data (trainingPartition)
var trainedClassifier = ee.Classifier.smileRandomForest({ // :: https://developers.google.com/earth-engine/apidocs/ee-classifier-smilerandomforest
  numberOfTrees: rf_params.ntree,
  variablesPerSplit: rf_params.mtry,
  minLeafPopulation: rf_params.nodesize,
  bagFraction: rf_params.sampsize
})
// .setOutputMode('CLASSIFICATION') // default :: https://developers.google.com/earth-engine/apidocs/ee-classifier-setoutputmode
.setOutputMode("REGRESSION")          // Set the model to perform regression
// .setOutputMode('PROBABILITY')
.train({
  features: trainingPartition,        // Feature collection containing the training data
  // classProperty: classProperty,
  classProperty: soilProperty,        // Property to predict (e.g., carbon stock)
  inputProperties: bands              // This call the names of the bands from the image 
  });

// Print RF classifier 
// print('Check trainedClassifier', trainedClassifier);

// Print explain() info about RF classifier 
// print('RF explained', trainedClassifier.explain());

//// Gradient Tree Boost classifier
// Train a 10-tree gradient boosting classifier from the training sample
//var trainedClassifier = ee.Classifier.smileGradientTreeBoost({
//  numberOfTrees: 1500, // Number of trees
//  shrinkage: 0.1,      // Shrinkage parameter, default 0.005, 0.1 is heavy and take long (1 min)
//  samplingRate: 0.7,   // Stochastic tree boosting, default 0.7, default is better
//  //maxNodes: 50       // The maximum number of leaf nodes in each tree. If unspecified, defaults to no limit, higther is better, but comment go to max (no limit)
//  // loss: 'LeastAbsoluteDeviation', //	Loss function for regression. One of: LeastSquares, LeastAbsoluteDeviation, Huber. default: "LeastAbsoluteDeviation"
//  // seed: 42          // Default 0
//}).setOutputMode('REGRESSION').train({ // default: 'CLASSIFICATION'
//  features: trainingPartition,
//  classProperty: soilProperty,
//  inputProperties: bands
//});


/////////////////////////////////////////////////////////////////////////////////////////
/// Predict to obtain the image, then show map 
/////////////////////////////////////////////////////////////////////////////////////////

// Predict over entire area (Namibia) with the trained model 
// 'Predictors' is an image with the predictor variables (bands)
// 'trainedClassifier' is a trained Random Forest regression model
var predicted_SOC_Map = predictors.classify(trainedClassifier);                           // This is suggested by the documentation :: https://developers.google.com/earth-engine/apidocs/ee-classifier-smilerandomforest      
  //.rename('socPred')
  //.round()      // Rounding the values, comment if your values are small
  //.int16();     // Converting to 16-bit integer, comment if your values are small

/////////////////////////////////////////////////////////////////////////////////////////
/// Load study area (shapefile or box) 
/////////////////////////////////////////////////////////////////////////////////////////
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

// Define style for the 
var contour = bbox.style({
  color: '#585858',      // Cont color 
  width: 1,              // Line thisckness
  fillColor: '00000000'  // Fill color transparent 
});
// Add bbox shape to map view 
Map.addLayer(contour, {}, 'bbox contour', true);

// Clip to study area
predicted_SOC_Map = predicted_SOC_Map.clip(bbox);
// print(predicted_SOC_Map, 'predicted_SOC_Map as band');

// Add predicted raster to map view
Map.addLayer(predicted_SOC_Map, {min: soil_prop_min, max: soil_prop_max, palette: soil_palette_col}, 'SOC Map Nam', true);


/////////////////////////////////////////////////////////////////////////////////////////
/// Export predited image as Cloud Optimized GeoTIFF (COG) by setting the "cloudOptimized"
/////////////////////////////////////////////////////////////////////////////////////////
var export_path_file_name_gdrive = 'Kenya_soil_map_' + soilProperty + '_export_gdrive';

// print('export_path_file_name_gdrive', export_path_file_name_gdrive);

// Export predicted map covering entire country to drive 
Export.image.toDrive({
 image: predicted_SOC_Map,
 description: export_path_file_name_gdrive,
 folder: 'earth_engine_Mount_Kenya_SOC_Map_0_20cm',
 region: bbox,
 scale: 30,
 crs: 'EPSG:4326',
 maxPixels: 1e13//,
// formatOptions: {
//   cloudOptimized: true // it was giving errors, then comment
// }
});

// Export to asset
// Get the user and build the export path
var userRoot = ee.data.getAssetRoots()[0].id; // e.g., users/gelsleichter
var asset_id = userRoot + '/Mount_Kenya_SOC_Map_0_20_cm'; // build like: 'users/gelsleichter/predictors_m_kenya_epsg_4326'
Export.image.toAsset({
  image: predicted_SOC_Map,
  description: 'earth_engine_Mount_Kenya_SOC_Map_export_Asset',
  assetId: asset_id,
  region: bbox,
  scale: 30,
  crs: 'EPSG:4326',
  maxPixels: 1e13
});

// CHeck Asset ID
print('Asset ID', asset_id);


//--------------------------------------------------------------------------------//  
//    .___  ___.  _______ .___________..______       __    ______     _______.    //
//    |   \/   | |   ____||           ||   _  \     |  |  /      |   /       |    //
//    |  \  /  | |  |__   `---|  |----`|  |_)  |    |  | |  ,----'  |   (----`    //
//    |  |\/|  | |   __|      |  |     |      /     |  | |  |        \   \        //
//    |  |  |  | |  |____     |  |     |  |\  \----.|  | |  `----.----)   |       //
//    |__|  |__| |_______|    |__|     | _| `._____||__|  \______|_______/        //
//                                                                                //
//--------------------------------------------------------------------------------// https://patorjk.com/software/taag/

/////////////////////////////////////////////////////////////////////////////////////////
/// Predict to obtain metrics
/////////////////////////////////////////////////////////////////////////////////////////
// Predict train data for calibration 
var predicted_Kenya_SOC_train = trainingPartition.classify(trainedClassifier); 
//print('predicted_Kenya_SOC_train', predicted_Kenya_SOC_train);
// Predict test data for validation 
var predicted_Kenya_SOC_test = testingPartition.classify(trainedClassifier); 
//print('predicted_Kenya_SOC_test', predicted_Kenya_SOC_test);

//////// Extract values from features the output will be a list
// Predicted values ('classification' is the correct name to put here)
var predicted_from_train = predicted_Kenya_SOC_train.aggregate_array('classification'); // if place OC__0-30 cm here, it will extract the observed values
var predicted_from_test = predicted_Kenya_SOC_test.aggregate_array('classification'); // if place OC__0-30 cm here, it will extract the observed values
// Observed values
// var observed_from_train = trainingPartition.aggregate_array('SOC'); // replaced with soilProperty
// var observed_from_test = testingPartition.aggregate_array('SOC'); // replaced with soilProperty
var observed_from_train = trainingPartition.aggregate_array(soilProperty);
var observed_from_test = testingPartition.aggregate_array(soilProperty);

////////////////////////////////////////////////////////////////////////////
/// Metrics calibration
////////////////////////////////////////////////////////////////////////////
//// RMSE
// Defining the vectors as Earth Engine arrays
var observed_array_cal = ee.Array(observed_from_train); // calibration
var predicted_array_cal = ee.Array(predicted_from_train); // calibration
// Performing subtraction
var error = observed_array_cal.subtract(predicted_array_cal);
// print('The error: ', error);
// Raising each element of "error" to the power of 2 using pow
var squaredError = error.pow(2);
// var squaredError = error.multiply(error); // other option
// Calculating the mean of the elements in squaredError
var meanSquaredError = squaredError.reduce(ee.Reducer.mean(), [0]); // For a one-dimensional array, the dimension is 0
// Taking the square root of the mean squared error to get the RMSE
var rmse_cal = meanSquaredError.sqrt();
// Printing the RMSE value
print('The RMSE Calibration is: ', rmse_cal);

//// R2
// Convert arrays to lists
var list1_cal = ee.List(observed_from_train);
var list2_cal = ee.List(predicted_from_train);
// Combine the lists into a list of pairs
var pairedList = list1_cal.zip(list2_cal);
// Calculate Pearson's correlation
var corr = pairedList.reduce(ee.Reducer.pearsonsCorrelation());
// Since GEE sometimes mixes JavaScript and Earth Engine objects, 
// we need to ensure we're working with an ee.Dictionary
var corrDict = ee.Dictionary(corr);
// Now we can use ee.Dictionary methods to extract values
var correlationValue = corrDict.get('correlation');
var pValue = corrDict.get('p-value');
// print('Correlation:', correlationValue);
// print('P-value:', pValue);
// Calculate the coefficient of determination (R²)
var coef_det_cal = ee.Number(correlationValue).pow(2);
// Print the result
print('The Calibration R² is: ', coef_det_cal);


/////// Validation - compact without comments
//// RMSE
var observed_array_val = ee.Array(observed_from_test); // validation
var predicted_array_val = ee.Array(predicted_from_test); // validation
var rmse_val = observed_array_val.subtract(predicted_array_val)
.pow(2)
.reduce(ee.Reducer.mean(), [0])
.sqrt();
print('The RMSE Validation is: ', rmse_val);

//// R2 
var list1_val = ee.List(observed_from_test);
var list2_val = ee.List(predicted_from_test);
var pairedList = list1_val.zip(list2_val);
var corr = pairedList.reduce(ee.Reducer.pearsonsCorrelation());
var corrDict = ee.Dictionary(corr);
var correlationValue = corrDict.get('correlation');
var pValue = corrDict.get('p-value');
var coef_det_val = ee.Number(correlationValue).pow(2);
print('The Validation R² is: ', coef_det_val);



//-------------------------------------------------//
//     __________.__          __                   //
//     \______   \  |   _____/  |_  ______         //
//      |     ___/  |  /  _ \   __\/  ___/         //
//      |    |   |  |_(  <_> )  |  \___ \          //
//      |____|   |____/\____/|__| /____  >         //
//                                     \/          //
//-------------------------------------------------// https://patorjk.com/software/taag/

///////////////////////////////////////////////////////////////////////////////////
/// Plot Obs vs Pred Calibration - for the plot
///////////////////////////////////////////////////////////////////////////////////
// Combine lists into FeatureCollection
// + predicted_from_train
// + observed_from_train
// - predicted_from_test
// - observed_from_test

// To criate a combined FeatureCollection with the two: observed and predicted
var combined_train = ee.List.sequence(0, observed_from_train.length().subtract(1))
  .map(function(index) {
    return ee.Feature(null, {
      'observed': observed_from_train.get(index),
      'predicted': predicted_from_train.get(index)
    });
  });

var fc_train = ee.FeatureCollection(combined_train);

var withError_train = fc_train.map(function(feature) {
  var obs = ee.Number(feature.get('observed'));
  var pred = ee.Number(feature.get('predicted'));
  var error = obs.subtract(pred);
  var squaredError = error.pow(2);
  return feature.set({
    'observed': obs,
    'predicted': pred,
    'error': error,
    'squaredError': squaredError
  });
});
// Calcular RMSE  
var mse_train = withError_train.aggregate_mean('squaredError');
var rmse_train = ee.Number(mse_train).sqrt();

// print('RMSE from fun (double check):', rmse_train);

// Print some stats 
var obsStats = withError_train.aggregate_stats('observed');
var predStats = withError_train.aggregate_stats('predicted');
// print('Stats of observed values:', obsStats);
// print('Stats of predicted values:', predStats);
// Some data example 
// print('Sample data:', withError_train.limit(10));

/////////////////////////////////////////////////////////////
// Get min max values from observed
var minObs = ee.Number(withError_train.aggregate_min('observed'));
var maxObs = ee.Number(withError_train.aggregate_max('observed'));

// Create 1:1 series for 1:1 line 
var oneToOne = ee.List.sequence(minObs, maxObs, null, 100);
var oneToOneFeatures = oneToOne.map(function(x) {
  return ee.Feature(null, {observed: x, predicted: x, series: 'one_to_one'});
});

// Add serie as a property of 'series' to original data 
var withErrorLabeled = withError_train.map(function(f) {
  return f.set('series', 'data');
});

// Combine data original with 1:1 line
var combinedFeatures_train = withErrorLabeled.merge(ee.FeatureCollection(oneToOneFeatures));

// Criate plot 
var scatterPlot = ui.Chart.feature.groups({
  features: combinedFeatures_train,
  xProperty: 'observed',
  yProperty: 'predicted',
  seriesProperty: 'series'
})
.setChartType('ScatterChart')
.setOptions({
  title: '',
  //title: 'Observed vs. Predicted',
  hAxis: {
    title: 'Observed',
    viewWindow: {min: minObs, max: maxObs}
  },
  vAxis: {
    title: 'Predicted',
    viewWindow: {min: minObs, max: maxObs}
  },
  series: {
    data: {visibleInLegend: true, pointSize: 4, color: 'blue'},
    1: {
      visibleInLegend: true,
      pointSize: 0,
      lineWidth: 0.6,
      color: 'green',
      lineDashStyle: [4, 4],
      labelInLegend: '1:1 Line'
    }
  },
  trendlines: {
    0: {
      color: 'magenta',
      lineWidth: 1,
      opacity: 0.7,
      showR2: true,
      visibleInLegend: true,
      labelInLegend: 'Trend Line'
    }
  }, 
  legend: {position: 'top-right'}, // top-left, none, bottom, top
  dataOpacity: 0.6
});

print('Obs pred Plot Calibration _______:', scatterPlot);


///////////////////////////////////////////////////////////////////////////////////
/// Plot Obs vs Pred Validation
///////////////////////////////////////////////////////////////////////////////////
// Combine lists into FeatureCollection
// - predicted_from_train
// - observed_from_train
// + predicted_from_test
// + observed_from_test

// To criate a combined FeatureCollection with the two: observed and predicted
var combined_test = ee.List.sequence(0, observed_from_test.length().subtract(1))
  .map(function(index) {
    return ee.Feature(null, {
      'observed': observed_from_test.get(index),
      'predicted': predicted_from_test.get(index)
    });
  });

var fc_test = ee.FeatureCollection(combined_test);

var withError_test = fc_test.map(function(feature) {
  var obs = ee.Number(feature.get('observed'));
  var pred = ee.Number(feature.get('predicted'));
  var error = obs.subtract(pred);
  var squaredError = error.pow(2);
  return feature.set({
    'observed': obs,
    'predicted': pred,
    'error': error,
    'squaredError': squaredError
  });
});
// Calculate RMSE  
var mse_test = withError_test.aggregate_mean('squaredError');
var rmse_test = ee.Number(mse_test).sqrt();

print('RMSE from fun (double check):', rmse_test);

// Print some stats 
var obsStats = withError_test.aggregate_stats('observed');
var predStats = withError_test.aggregate_stats('predicted');
// print('Stats of observed values:', obsStats);
// print('Stats of predicted values:', predStats);
// Some data example 
// print('Sample data:', withError_test.limit(10));


/////////////////////////////////////////////////////////////
// Get min max values from observed
var minObs = ee.Number(withError_test.aggregate_min('observed'));
var maxObs = ee.Number(withError_test.aggregate_max('observed'));

// Create 1:1 series for 1:1 line 
var oneToOne = ee.List.sequence(minObs, maxObs, null, 100);
var oneToOneFeatures = oneToOne.map(function(x) {
  return ee.Feature(null, {observed: x, predicted: x, series: 'one_to_one'});
});

// Add serie as a property of 'series' to original data 
var withErrorLabeled = withError_test.map(function(f) {
  return f.set('series', 'data');
});

// Combine data original with 1:1 line
var combinedFeatures_test = withErrorLabeled.merge(ee.FeatureCollection(oneToOneFeatures));

// Criate plot 
var scatterPlot = ui.Chart.feature.groups({
  features: combinedFeatures_test,
  xProperty: 'observed',
  yProperty: 'predicted',
  seriesProperty: 'series'
})
.setChartType('ScatterChart')
.setOptions({
  title: '',
  //title: 'Observed vs. Predicted',
  hAxis: {
    title: 'Observed',
    viewWindow: {min: minObs, max: maxObs}
  },
  vAxis: {
    title: 'Predicted',
    viewWindow: {min: minObs, max: maxObs}
  },
  series: {
    data: {visibleInLegend: true, pointSize: 4, color: 'blue'},
    1: {
      visibleInLegend: true,
      pointSize: 0,
      lineWidth: 0.6,
      color: 'green',
      lineDashStyle: [4, 4],
      labelInLegend: '1:1 Line'
    }
  },
  trendlines: {
    0: {
      color: 'magenta',
      lineWidth: 1,
      opacity: 0.7,
      showR2: true,
      visibleInLegend: true,
      labelInLegend: 'Trend Line'
    }
  },
  legend: {position: 'top-right'}, // top-left, none, bottom, top
  dataOpacity: 0.6
});

print('Obs pred Plot Validation _______:', scatterPlot);


/////////////////////////////////////////////////////////////////////////////////////////
/// Plot var importance, source:  
/// https://www.researchgate.net/post/How-to-calculate-and-plot-the-feature-importance-of-the-input-dataset-of-a-random-forest-classification-within-Google-Earth-Engine-GEE
/// https://gis.stackexchange.com/questions/427565/variable-importance-for-random-forest-classification-in-gee
/////////////////////////////////////////////////////////////////////////////////////////

// get a dictionary with the feature importance of the classifier
var dict_featImportance = trainedClassifier.explain();
print(dict_featImportance, 'Print dict_featImportance');

// Cast into a ee.Feature and a ee.FeatureCollection for exporting the importance as CSV
var variable_importance = ee.Feature(null, ee.Dictionary(dict_featImportance).get('importance'));
var variable_importance01 = ee.FeatureCollection(variable_importance);

// Export the FeatureCollection as CSV
Export.table.toDrive({
collection: variable_importance01,
description: 'variable_importance_subset01', 
folder: 'earth_engine_Nam',
fileFormat: 'CSV'
});

// Print some info about the classifier 
// with column ordering :: https://gis.stackexchange.com/a/400737
var exp = trainedClassifier.explain();
print('RF explained', exp);

var importance = ee.Dictionary(exp.get('importance'));
var keys = importance.keys().sort(importance.values()).reverse();
var values = importance.values(keys);
var rows = keys.zip(values).map(function(list) {
  return {c: ee.List(list).map(function(n) { return {v: n}; })};
});

var dataTable = {
  cols: [{id: 'band', label: 'Band', type: 'string'},
         {id: 'importance', label: 'Importance', type: 'number'}],
  rows: rows
};

// verify, it breaked
ee.Dictionary(dataTable).evaluate(function(result) {
  var chart = ui.Chart(result)
    .setChartType('ColumnChart')
    .setOptions({
      title: 'Random Forest Variable Importance',
      legend: {position: 'none'},
      hAxis: {title: 'Bands'},
      vAxis: {title: 'Importance'}
    });
  print(chart, 'Chart: Random forest variable importance');
});



/////////////////////////////////////////////////////////////////////////////////////////
/// Plot legend :: https://gis.stackexchange.com/a/422014/178680 
/////////////////////////////////////////////////////////////////////////////////////////
// var vis = {min: 0, max: 2, palette: soil_palette_col}; 
var vis = {min: soil_prop_min, max: soil_prop_max, palette: soil_palette_col}; 

var nSteps = 10; 
// Creates a color bar thumbnail image for use in legend from the given color palette
function makeColorBarParams(soil_palette_col) {
  return {
    bbox: [0, 0, nSteps, 0.1],
    dimensions: '100x10',
    format: 'png',
    min: 0,
    max: nSteps,
    palette: soil_palette_col,
  };
}

// Create the colour bar for the legend
var colorBar = ui.Thumbnail({
  image: ee.Image.pixelLonLat().select(0).int(),
  params: makeColorBarParams(vis.palette),
  style: {stretch: 'horizontal', margin: '0px 8px', maxHeight: '24px'},
});

// Create a panel with three numbers for the legend
var legendLabels = ui.Panel({
  widgets: [
    ui.Label(vis.min, {margin: '4px 8px'}),
    ui.Label(
        ((vis.max-vis.min) / 2+vis.min),
        {margin: '4px 8px', textAlign: 'center', stretch: 'horizontal'}),
    ui.Label(vis.max, {margin: '4px 8px'})
  ],
  layout: ui.Panel.Layout.flow('horizontal')
});


// automated legend title label
var value_leg_title = 'Soil Map of ' + soilProperty + ' ' + unity;

// Legend title
var legendTitle = ui.Label({
  //value: 'Soil carbon Namibia 0-30 cm (%)',
  value: value_leg_title,
  style: {fontWeight: 'bold'}
});

// Add the legendPanel to the map
// var legendPanel = ui.Panel([legendTitle, colorBar, legendLabels]);
var legendPanel = ui.Panel([legendTitle, colorBar, legendLabels], null, {position: 'top-left'}); // bottom-right, top-right, top-left, none, bottom, top
Map.add(legendPanel);

*/// --- End move coment --- // 


//------------------------------------------------------------------------------// 
//      __________      _________   ________            _____        _____      //
//      ___  ____/____________  /   __  ___/_______________(_)_________  /_     //
//      __  __/  __  __ \  __  /    _____ \_  ___/_  ___/_  /___  __ \  __/     //
//      _  /___  _  / / / /_/ /     ____/ // /__ _  /   _  / __  /_/ / /_       //
//      /_____/  /_/ /_/\__,_/      /____/ \___/ /_/    /_/  _  .___/\__/       //
//                                                           /_/                //
//------------------------------------------------------------------------------// 
