//*****************************************************************************
// CATS trailheads on choice of basemap with search and overlay functionality
//*****************************************************************************

// ----------------------------------------------------------------------------
// Basemap raster layers
// ----------------------------------------------------------------------------
// Bing aerial / satellite
var bing_apiKey = 
  'AnzqNFpB9ZzIlfH-0TOSdPI2rewJfDtC4Raw26pX9NIFyGCFh0HtzCXSFE20FPO2';
var aerialLayer = new ol.layer.Tile({
  source: new ol.source.BingMaps({
    key: bing_apiKey,
    imagerySet: "Aerial",
    attributions: [
      new ol.Attribution({  // this is being IGNORED
        html: "<br />Aerial &copy; 2018 Microsoft Corporation Earthstar " + 
        "Geographics SIO <a href='http://www.microsoft.com/maps/product/terms.html'>" +
        "Terms of use</a>." 
      }),
    ],
  }),
  title: "Aerial",
});

// Thunderforest types: cycle, landscape, mobile-atlas, neighbourhood, 
// outdoors, pioneer, spinal-map, transport, transport-dark
// BEST for mapping trails etc: landscape or outdoors
apiKey_TF = '06dd34a5c0a849d8b74419c5c38c2b9b'; //NOTE: apiKey does have limits
type_TF = 'outdoors';
url_TF = 'https://{a-c}.tile.thunderforest.com/';
url_TF += type_TF + '/{z}/{x}/{y}.png?apikey=' + apiKey_TF;
var outdoorsLayer = new ol.layer.Tile({
  source: new ol.source.OSM({
    attributions: [
      new ol.Attribution({  // Includes ending leader for terrain attribution
        html: "<br />Outdoors: Map tiles &copy; " +
        "<a href='https://www.thunderforest.com'>Thunderforest</a>, " +
        "Data &copy; <a href='https://www.openstreetmap.org/copyright'>" + 
        "OpenStreetMap contributors</a>.<br />Terrain: "
      }),
    ],
    url: url_TF,
  }),
  title: "Outdoors",
});

// Stamen terrain
var terrainLayer = new ol.layer.Tile({
  source: new ol.source.Stamen({
    layer: "terrain",
    attributions: [
      new ol.Attribution({  // this is being IGNORED
        html: "<br />Terrain: tiles by " + 
        "<a href='http://stamen.com'>Stamen Design</a>, " +
        "under <a href='http://creativecommons.org/licenses/by/3.0'>CC BY 3.0</a>. " +
        "Data by <a href='http://openstreetmap.org'>OpenStreetMap</a>, " + 
        "under <a href='http://www.openstreetmap.org/copyright'>ODbL</a>. "
      }),
      //ol.source.Stamen.ATTRIBUTIONS,
    ],
  }),
  title: "Terrain",
});

// Standard OSM
var osmLayer = new ol.layer.Tile({
  source: new ol.source.OSM({
    attributions: [
      new ol.Attribution({  // Includes ending leader for aerial attribution
        html: "<br />Map: &copy; <a href='https://www.openstreetmap.org/copyright'>" + 
        "OpenStreetMap contributors</a>.<br />Aerial:"
      }),
    ],
  }),
  title: "Map",
});

// ----------------------------------------------------------------------------
// Layer switcher function
// ----------------------------------------------------------------------------
var LayerSwitcher = function(options) {
  options = options || {};
  var className = options.className ? options.className : 'ol-layer-switcher';
  var cssClasses = className + ' ' + ol.css.CLASS_UNSELECTABLE + ' ' + ol.css.CLASS_CONTROL;
  var layers = options.layers;

  // Create ul list and add li elements for each layer 
  var list = document.createElement('ul');
  layers.forEach(function(layer, index, layers) {
    var li = document.createElement('li');
    li.setAttribute('data-layer-ref', ++index);
    //li.innerHTML = 'Layer ' + index;
    li.innerHTML = layer.get('title');
    if (index === layers.length) li.className = 'active';
    
    list.appendChild(li);
  });

  // Create a div, if a li is clicked, set to active
  var controlDiv = goog.dom.createDom('div', cssClasses, list);

  controlDiv.addEventListener('click', function(event) {
    if (event.target.nodeName.toLowerCase() === 'li') {
      var itemNumber = parseInt(event.target.getAttribute('data-layer-ref'), 10);

      list.querySelector('.active').className = '';
      list.querySelector('[data-layer-ref="' + itemNumber + '"]').className = 'active';
      itemNumber--;

      // Turn off all but this layer
      layers.forEach(function(layer, index) {
        if (index < 5) {layers.item(index).setVisible(index === itemNumber);}
      });
    }
  });

  ol.control.Control.call(this, {
    element: controlDiv
  });
};

ol.inherits(LayerSwitcher, ol.control.Control);

// ----------------------------------------------------------------------------
// Buffered Trailheads style and GeoJSON polygon sources and layers
// ----------------------------------------------------------------------------
var polyStyle = new ol.style.Style({
  stroke : new ol.style.Stroke({color: 'rgba(204, 0, 0, 1.0)', width: 1}),
  fill : new ol.style.Fill({color: 'rgba(204, 0, 0, 1.0)'}),
});
var polySource80m = new ol.source.Vector({
  projection: 'EPSG:3857',
  url: 'CATS_trailheads_3857_buffer80m.geojson',
  format: new ol.format.GeoJSON({defaultDataProjection: 'EPSG:3857'}),
});
var polyLayer80m = new ol.layer.Vector({
  source: polySource80m, 
  style: polyStyle,
  opacity: 0,
  zIndex: 1,
});

var polySource400m = new ol.source.Vector({
  projection: 'EPSG:3857',
  url: 'CATS_trailheads_3857_buffer400m.geojson',
  format: new ol.format.GeoJSON({defaultDataProjection: 'EPSG:3857'}),
});
var polyLayer400m = new ol.layer.Vector({
  source: polySource400m, 
  style: polyStyle,
  opacity: 0,
  zIndex: 1,
});

var polySource1000m = new ol.source.Vector({
  projection: 'EPSG:3857',
  url: 'CATS_trailheads_3857_buffer1000m.geojson',
  format: new ol.format.GeoJSON({defaultDataProjection: 'EPSG:3857'}),
});
var polyLayer1000m = new ol.layer.Vector({
  source: polySource1000m, 
  style: polyStyle,
  opacity: 0,
  zIndex: 1,
});

// ----------------------------------------------------------------------------
// Vector sources that load GeoJSON files
// ----------------------------------------------------------------------------
// Point source and layer
var pointsSource = new ol.source.Vector({
  projection: 'EPSG:3857',
  url: 'CATS_trailheads_3857.geojson',
  format: new ol.format.GeoJSON({defaultDataProjection: 'EPSG:3857'}),
  attributions: [
    new ol.Attribution({  // Includes summary attribs between Bing logo and CATS
      html: " | Thunderforest | Stamen | OpenStreetMap | CATS" + 
      "<br />CATS Trailheads from " +
      "<a href='http://www.champlainareatrails.com/'>" +
      "Champlain Area Trails</a>."
    }),
  ],
});
// Generic style for points
var pointsStyle = new ol.style.Style({
  image: new ol.style.Circle({
    radius: 4,
    fill: new ol.style.Fill({color: [204, 0, 0]}),
    //stroke: new ol.style.Stroke({color: [204, 0, 0], width: 2}),
  })
});
// Hard-coded extent and center of points layer
var pointsExtent = ol.proj.transformExtent(
  [-73.8, 43.7, -73.3, 44.6], 'EPSG:4326', 'EPSG:3857'
);
var pointsCenter = ol.proj.fromLonLat([-73.55, 44.15]);

// ----------------------------------------------------------------------------
// Keyboard functionality for Pan and Zoom
// Also needs: interactions and keyboardEventTarget props on 'map' object below
// ----------------------------------------------------------------------------
var keyboardPan = new ol.interaction.KeyboardPan({
  duration: 90,
  pixelDelta: 256,
});
var keyboardZoom = new ol.interaction.KeyboardZoom({duration: 90});

// ----------------------------------------------------------------------------
// Control of various controls to show on the map
// ----------------------------------------------------------------------------
var controls = [
    new ol.control.Attribution({}),
    new ol.control.MousePosition({
      coordinateFormat: ol.coordinate.createStringXY(3),
      projection: 'EPSG:4326',
    }),
    new ol.control.OverviewMap({collapsed: false, collapsible: false}),
    new ol.control.FullScreen(),
    new ol.control.Rotate({autoHide: false}),
    new ol.control.ScaleLine(),
    new ol.control.Zoom(),
    new ol.control.ZoomSlider(),
    new ol.control.ZoomToExtent({extent: pointsExtent}),
];

// ----------------------------------------------------------------------------
// The map, only add raster layer for now
// ----------------------------------------------------------------------------
var map = new ol.Map({
  view: new ol.View({
    zoom: 9,
    minZoom: 3,
    //maxZoom: 19, /* maxZoom 19 for Bing */
    center: pointsCenter,
  }),
  layers: [
    aerialLayer,
    outdoorsLayer,
    terrainLayer,
    osmLayer,
  ],
  target: 'js-map',
  controls: controls,
  interactions: ol.interaction.defaults().extend([keyboardPan, keyboardZoom,]),
  keyboardEventTarget: document,
});

// Add control for layer switcher
map.addControl(new LayerSwitcher({
  layers: map.getLayers()
}));

// Add polygon layers
var polyLayerGroup = new ol.layer.Group({layers: [
  polyLayer1000m,
  polyLayer400m,
  polyLayer80m,
]});
map.addLayer(polyLayerGroup);

// DEBUGGING ONLY: Update zoom value in html on resolution change
/*
var zoomElem = document.getElementById('js-zoom-val');
var updateUI = function(event) {
    zoomElem.value = map.getView().getZoom();
    zoomElem.innerHTML = map.getView().getZoom();
};
updateUI();
map.getView().on(['change:resolution'], updateUI);
*/

// ----------------------------------------------------------------------------
// Style the points based on search criteria
// ----------------------------------------------------------------------------
// Trail name search element variable and event listener
var nameSrchElem = document.getElementById('js-search-name');
nameSrchElem.addEventListener('keyup', function() {vectorLayer.changed();});

// Cache all button values into variables
var easyBtn = document.getElementById('js-btn-easy');
var modBtn = document.getElementById('js-btn-mod');
var hardBtn = document.getElementById('js-btn-hard');

var allusesBtn = document.getElementById('js-btn-alluses');
var olookBtn = document.getElementById('js-btn-olook');
var haccBtn = document.getElementById('js-btn-hacc');
var bikeBtn = document.getElementById('js-btn-bike');
var xcskiBtn = document.getElementById('js-btn-xcski');

// Defaults
allusesBtn.value = "All Uses";
olookBtn.value = "off";
haccBtn.value = "off";
bikeBtn.value = "off";
xcskiBtn.value = "off";

// Regex for button class on/off values
var regexOn = /btn-success/, regexOff = /btn-default/;

// Listen for click events on all the buttons, set their values to off/on
// and toggle their className accordingly
easyBtn.addEventListener('click', function(event) {
  var element = event.target;
  // if button was on, turn off
  if (regexOn.test(element.className)) {
    element.className = element.className.replace('btn-success', 'btn-default');
    element.value = "off";
  } else {
    element.className = element.className.replace('btn-default', 'btn-success');
    element.value = element.innerHTML;
  }
  vectorLayer.changed();
  // DEBUGGING ONLY: set inner html of this value
  //document.getElementById('js-diff-val-easy').innerHTML = "easyBtn value: " + element.value;
});
modBtn.addEventListener('click', function(event) {
  var element = event.target;
  // if button was on, turn off
  if (regexOn.test(element.className)) {
    element.className = element.className.replace('btn-success', 'btn-default');
    element.value = "off";
  } else {
    element.className = element.className.replace('btn-default', 'btn-success');
    element.value = element.innerHTML;
  }
  vectorLayer.changed();
  // DEBUGGING ONLY: set inner html of this value
  //document.getElementById('js-diff-val-mod').innerHTML = "modBtn value: " + element.value;
});
hardBtn.addEventListener('click', function(event) {
  var element = event.target;
  // if button was on, turn off
  if (regexOn.test(element.className)) {
    element.className = element.className.replace('btn-success', 'btn-default');
    element.value = "off";
  } else {
    element.className = element.className.replace('btn-default', 'btn-success');
    element.value = element.innerHTML;
  }
  vectorLayer.changed();
  // DEBUGGING ONLY: set inner html of this value
  //document.getElementById('js-diff-val-hard').innerHTML = "hardBtn value: " + element.value;
});

allusesBtn.addEventListener('click', function(event) {
  var element = event.target;
  // if button was on, turn off
  if (regexOn.test(element.className)) {
    element.className = element.className.replace('btn-success', 'btn-default');
    element.value = "off";
  } else {
    // if button was off, turn on, AND turn off the other 4 usage buttons
    element.className = element.className.replace('btn-default', 'btn-success');
    element.value = "All Uses" //element.innerHTML;
    olookBtn.value = "off";
    olookBtn.className = olookBtn.className.replace('btn-success', 'btn-default');
    haccBtn.value = "off";
    haccBtn.className = haccBtn.className.replace('btn-success', 'btn-default');
    bikeBtn.value = "off";
    bikeBtn.className = bikeBtn.className.replace('btn-success', 'btn-default');
    xcskiBtn.value = "off";
    xcskiBtn.className = xcskiBtn.className.replace('btn-success', 'btn-default');
  }
  vectorLayer.changed();
  // DEBUGGING ONLY: set inner html of this value
  //document.getElementById('js-notes-val-alluses').innerHTML = "allusesBtn value: " + element.value;
});
olookBtn.addEventListener('click', function(event) {
  var element = event.target;
  // if button was on, turn off
  if (regexOn.test(element.className)) {
    element.className = element.className.replace('btn-success', 'btn-default');
    element.value = "off";
  } else {
    // if button was off, turn on, AND if alluses button had been on, turn it off
    element.className = element.className.replace('btn-default', 'btn-success');
    element.value = element.innerHTML;
    if (allusesBtn.value === "All Uses") {
      allusesBtn.value = "off";
      allusesBtn.className = allusesBtn.className.replace('btn-success', 'btn-default');
    };
  }
  vectorLayer.changed();
  // DEBUGGING ONLY: set inner html of this value
  //document.getElementById('js-notes-val-olook').innerHTML = "OlookBtn value: " + element.value;
});
haccBtn.addEventListener('click', function(event) {
  var element = event.target;
  // if button was on, turn off
  if (regexOn.test(element.className)) {
    element.className = element.className.replace('btn-success', 'btn-default');
    element.value = "off";
  } else {
    // if button was off, turn on, AND if alluses button had been on, turn it off
    element.className = element.className.replace('btn-default', 'btn-success');
    element.value = element.innerHTML;
    if (allusesBtn.value === "All Uses") {
      allusesBtn.value = "off";
      allusesBtn.className = allusesBtn.className.replace('btn-success', 'btn-default');
    };
  }
  vectorLayer.changed();
  // DEBUGGING ONLY: set inner html of this value
  //document.getElementById('js-notes-val-hacc').innerHTML = "haccBtn value: " + element.value;
});
bikeBtn.addEventListener('click', function(event) {
  var element = event.target;
  // if button was on, turn off
  if (regexOn.test(element.className)) {
    element.className = element.className.replace('btn-success', 'btn-default');
    element.value = "off";
  } else {
    // if button was off, turn on, AND if alluses button had been on, turn it off
    element.className = element.className.replace('btn-default', 'btn-success');
    element.value = element.innerHTML;
    if (allusesBtn.value === "All Uses") {
      allusesBtn.value = "off";
      allusesBtn.className = allusesBtn.className.replace('btn-success', 'btn-default');
    };
  }
  vectorLayer.changed();
  // DEBUGGING ONLY: set inner html of this value
  //document.getElementById('js-notes-val-bike').innerHTML = "bikeBtn value: " + element.value;
});
xcskiBtn.addEventListener('click', function(event) {
  var element = event.target;
  // if button was on, turn off
  if (regexOn.test(element.className)) {
    element.className = element.className.replace('btn-success', 'btn-default');
    element.value = "off";
  } else {
    // if button was off, turn on, AND if alluses button had been on, turn it off
    element.className = element.className.replace('btn-default', 'btn-success');
    element.value = element.innerHTML;
    if (allusesBtn.value === "All Uses") {
      allusesBtn.value = "off";
      allusesBtn.className = allusesBtn.className.replace('btn-success', 'btn-default');
    };
  }
  vectorLayer.changed();
  // DEBUGGING ONLY: set inner html of this value
  //document.getElementById('js-notes-val-xcski').innerHTML = "xcskiBtn value: " + element.value;
});

// Function to return trails attributes in an array
function getTrailsAttrArr(trailsIDsString, trailsAttr, splitChar) {
  // Split the string of trail IDs into an array for iteration
  var trailsArr = trailsIDsString.split(",");
  // For each of the trails, populate an attribute array
  var attrArr = [];
  for (var tr=0; tr < trailsArr.length; tr++) {
    // Lookup the tr_id in trData to get attribute info
    var tr_id = trailsArr[tr].trim();  // e.g. "A1"
    // Split attribute values and push if not already in array
    var attrArrTr = trData[tr_id][trailsAttr].split(splitChar);
    for (var d=0; d < attrArrTr.length; d++) {
      if (attrArr.indexOf(attrArrTr[d].trim()) === -1) {
        attrArr.push(attrArrTr[d].trim());
      }
    }
  }
  return attrArr;
}
// Function to get a wrapped-text string... NOT WORKING!
// this does not wrap, <br /> just shows up, \n does not work
function getWrappedString(longString, maxLen) {
  var strArr = longString.split(" ");
  var wrapStr = "", wrapLen = 0, wordLen = 0;
  for (var i=0; i < strArr.length; i++) {
    wordLen = strArr[i].trim().length;  // length of this word
    if (wrapLen !== 0 && wrapLen + 1 + wordLen >= maxLen) {
      wrapStr += "<br />" + strArr[i];
      wrapLen = wordLen;
    } else {
      wrapStr += " " + strArr[i];
      wrapLen += 1 + wordLen;
    }
  }
  return wrapStr;
}

  
// Function to style each feature individually
var styleFunction = function(feature) {
  var th_id = feature.get('th_id');
  var trailsIDsStr = feature.get('trails');
  
  // Get trail names, difficulty and notes arrays for trails at each feature
  var namesFtArr = getTrailsAttrArr(trailsIDsStr, "trailName", "|");
  var diffFtArr = getTrailsAttrArr(trailsIDsStr, "difficulty", "/");
  var notesFtArr = getTrailsAttrArr(trailsIDsStr, "notes", "|");
  
  var namesFtWrap = getWrappedString(namesFtArr.toString(), 16);
  var labelsText = namesFtWrap;
  
  // Cache the search and button values ("on" or "off") to variables
  var nameSrchVal = nameSrchElem.value;
  var easyBtnVal = easyBtn.value;
  var modBtnVal = modBtn.value;
  var hardBtnVal = hardBtn.value;
  
  var allusesBtnVal = allusesBtn.value;
  var olookBtnVal = olookBtn.value;
  var haccBtnVal = haccBtn.value;
  var bikeBtnVal = bikeBtn.value;
  var xcskiBtnVal = xcskiBtn.value;
  
  // If button values are null, for example the initial state, 
  // they are on, so set them to their values
  if (easyBtnVal == "") {easyBtnVal = "easy";};
  if (modBtnVal == "") {modBtnVal = "moderate";};
  if (hardBtnVal == "") {hardBtnVal = "difficult";};
  
  if (allusesBtnVal == "") {allusesBtnVal = "All Uses";};
  if (olookBtnVal == "") {olookBtnVal = "Overlook";};
  if (haccBtnVal == "") {haccBtnVal = "Handicap Accessible";};
  if (bikeBtnVal == "") {bikeBtnVal = "Bike";};
  if (xcskiBtnVal == "") {xcskiBtnVal = "XC-Ski";};
  
  // Create arrays with all the button values, for notes, count how many are on
  var diffBtnValsArr = [];
  var notesBtnValsArr = [];
  diffBtnValsArr = [easyBtnVal, modBtnVal, hardBtnVal];
  notesBtnValsArr = [allusesBtnVal, olookBtnVal, haccBtnVal, bikeBtnVal, xcskiBtnVal];
  /*
  if (allusesBtnVal == "All Uses") {
    notesBtnValsArr = [allusesBtnVal, "off", "off", "off", "off"];
  } else {
    notesBtnValsArr = [allusesBtnVal, olookBtnVal, haccBtnVal, bikeBtnVal, xcskiBtnVal];
  };
  */
  var notesBtnValsOn = 0;
  for (var n=0; n < notesBtnValsArr.length; n++) {
    if (notesBtnValsArr[n] !== "off") {notesBtnValsOn += 1;};
  }
  
  // DEBUGGING ONLY: set inner htmls for js-diff-val-elem and js-notes-val-elem
  /*
  document.getElementById('js-diff-val-elem').innerHTML = 
    "diffBtnValsArr: " + diffBtnValsArr.toString();
  document.getElementById('js-notes-val-elem').innerHTML = 
    "notesBtnValsArr: " + notesBtnValsArr.toString();
  */
  
  // For each trailhead's trails' difficulty values (e.g. diffFtArr = easy, moderate),
  // if the feature value found in selected diffBtnValsArr (e.g. moderate, difficult),
  // set diffIncluded to 1
  var diffIncluded = 0;
  for (var i=0; i < diffFtArr.length; i++) {
    if (diffBtnValsArr.indexOf(diffFtArr[i].trim()) !== -1) {
      diffIncluded = 1;
    };
  };
  
  // Similarly for notes, except if notesFtArr has empty values, all uses implied,
  // so push "All Uses" to notesFtArr. Also count how many match, to apply AND not OR
  notesFtArr.push("All Uses");
  var notesIncluded = 0;
  //if (notesFtArr.join('').length == 0) {notesFtArr.push("All Uses");}
  for (var j=0; j < notesFtArr.length; j++) {
    if (notesBtnValsArr.indexOf(notesFtArr[j].trim()) !== -1) {
      notesIncluded += 1;
    };
  };
  
  // DEBUGGING ONLY: alternative for labels text
  labelsText = "diff: "+diffIncluded+", notes:"+notesIncluded+", notesOn:"+notesBtnValsOn;
  //labelsText += ", notesFtArr: "+notesFtArr.toString();
  
  // By default, show point symbols only
  var opacitySymb = 1, opacityText = 0; 
  
  // If there is a name search request or any buttons turned off:
  if (nameSrchVal || 
      easyBtnVal==="off" || modBtnVal==="off" || hardBtnVal==="off" || 
      allusesBtnVal==="off" || olookBtnVal==="off" || haccBtnVal==="off" || 
      bikeBtnVal==="off" || xcskiBtnVal==="off") {
    // Fade out feature's point if it does not match search queries:
    if (namesFtArr.toString().search(new RegExp(nameSrchVal, 'i')) === -1 ||
        diffIncluded === 0 || 
        notesIncluded === 0 || notesIncluded < notesBtnValsOn) {
      opacitySymb = 0.1; opacityText = 0;
    } else {
      // Potentially turn on labels if there is any match
      opacitySymb = 1; opacityText = 0;
    }
  } else {
    // No search request will have these values
    opacitySymb = 1; opacityText = 0;
  }

  return [
    new ol.style.Style({
      image: new ol.style.Circle({
        radius: 5,
        fill: new ol.style.Fill({color: [204, 0, 0, opacitySymb]}),
        stroke: new ol.style.Stroke({color: [204, 0, 0, opacitySymb]}),
      }),
      text: new ol.style.Text({
        text: labelsText,
        fill: new ol.style.Fill({color: [0, 0, 205, opacityText]}),
        //stroke: new ol.style.Stroke({color: [204, 0, 0, opacityText], width: 1}),
        font: '14px "Helvetica Neue", Arial',
      })
    })
  ];
};

// Add the trailhead points vector layer
var vectorLayer = new ol.layer.Vector({
  source: pointsSource,
  style: styleFunction,
  zIndex: 2,
});

map.addLayer(vectorLayer);

// ----------------------------------------------------------------------------
// Overlay (popup) on clicking vector features: use polygons not points
// ----------------------------------------------------------------------------
var overlayElem = document.getElementById('js-overlay');
var trailsElem = document.getElementById('js-trails');
var photoElem = document.getElementById('js-photo');

var overlay = new ol.Overlay({element: overlayElem});

map.addOverlay(overlay);
overlayElem.style.display = 'block';

// If map is clicked, show overlay if click was in buffer of trailhead point
map.on('singleclick', function(event) {
  overlay.setPosition(undefined);
  // Set responding features to one of the buffered polygons based on zoom level
  currentZoom = map.getView().getZoom();
  if (currentZoom >= 14) {
    var features = 
      polyLayer80m.getSource().getFeaturesAtCoordinate(event.coordinate);
  } else if (currentZoom >= 11) {
    var features = 
      polyLayer400m.getSource().getFeaturesAtCoordinate(event.coordinate);
  } else {
    var features = 
      polyLayer1000m.getSource().getFeaturesAtCoordinate(event.coordinate);
  }

  if (features.length > 0) {
      
    overlay.setPosition(event.coordinate); //e.g. -8173927.38,5506275.1
    
    // Trailhead ID is unique, may include in header
    thID = features[0].get('th_id')
    
    // The 'trails' variable has one or more trail IDs, 
    // get info for each of these trails from trData:
    // trailName, trailDist, difficulty, description, owners, notes, maplink
    var trailsStr = features[0].get('trails');
    var trailsArray = trailsStr.split(",")
    var numTrails = trailsArray.length;
    var trailsInfo = "";
    for (var i = 0; i < numTrails; i++) {
      var trID = trailsArray[i].trim()
      // Look up trail detail from trData variable in CATS_trails.js
      if (trData.hasOwnProperty(trID)) {
        if (i > 0) {trailsInfo += '<br />'}
        trailsInfo += '<strong>' + trData[trID].trailName + '</strong>: ' +
          '<br /><em>' + trData[trID].difficulty + '; ' + trData[trID].trailDist +
          '</em><br />' + trData[trID].description;
        trailsInfo += ' Land owned by ' + trData[trID].owners + '.';
        if (trData[trID].maplink.length > 1) {
          trailsInfo += ' <a href="' + trData[trID].maplink + '" target="_blank">' + 
          '<em>View PDF map.</em></a>';
        }
        if (trData[trID].notes) {
          trailsInfo += ' <em>' + trData[trID].notes + '.</em> ';
        }
      }
      else {trailsInfo += '<br />Trail ID ' + trID;}
    }
    trailsElem.innerHTML = trailsInfo;
    
    // Photos at thID have thumbnail that links to fullsize
    var thumb = '../images/th_thumbnails/' + thID + '.jpg';
    var fullres = '../images/th_fullres/' + thID + '.jpg';
    // This function may be deprecated but it worked, unlike other solutions
    // https://stackoverflow.com/questions/3646914/how-do-i-check-if-file-exists-in-jquery-or-pure-javascript
    function imageExists(image_url) {
      var http = new XMLHttpRequest();
      http.open('HEAD', image_url, false);
      http.send();
      return http.status != 404;
    }
    // Not all thIDs will have photos, if none then just leave out
    if (imageExists(thumb) && imageExists(fullres)) {
      var thPhoto = '<a href="' + fullres + '" target="_blank">' + 
        '<img src="' + thumb + '" width="300"></a>';
    } else {var thPhoto = '';};
    //} else {var thPhoto = '<em>Trailhead photo not available.</em>;'}
    photoElem.innerHTML = thPhoto;
  }
});
