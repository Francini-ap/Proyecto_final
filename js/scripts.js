// Mapa Leaflet
var mapa = L.map('mapid').setView([9.9, -84.05], 12.9);

var capa_osm = L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?', 
  {
    maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }
).addTo(mapa);	

// Segunda capa base
var capa_hot = L.tileLayer(
    'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', 
   {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>'
   }
).addTo(mapa);


	
// Conjunto de capas base
var capas_base = {
  "OSM": capa_osm,
  "OSM Forest" : capa_hot,

  
};  

// Agregar capa WMS- Capa de Proviencias
var capa_prov = L.tileLayer.wms('https://geos.snitcr.go.cr/be/IGN_5/wfs', {
  layers: 'limiteprovincial_5k',
  format: 'image/png',
  transparent: true
}).addTo(mapa);


// Capa vectorial rios en formato GeoJSON
$.getJSON("https://francini-ap.github.io/datos_tarea02/rios/rios_cbima.geojson", function(geodata) {
  var capa_rios = L.geoJson(geodata, {
    style: function(feature) {
	  return {'color': " #093af1 ", 'weight': 1.5, 'fillOpacity': 0.0}
    },
    onEachFeature: function(feature, layer) {
      var popupText = "<strong>Nombre</strong>: " + feature.properties.NOMBRE;
      layer.bindPopup(popupText);
    }			
  }).addTo(mapa);

  control_capas.addOverlay(capa_rios, 'Ríos');

});	
// Capa vectorial límite cbima formato GeoJSON
$.getJSON("https://francini-ap.github.io/datos_tarea02/cbima/limite_cbima.geojson", function(geodata) {
  var capa_limite = L.geoJson(geodata, {
    style: function(feature) {
	  return {'color': "#f02108", 'weight': 2.5, 'fillOpacity': 0.0}
    },
    onEachFeature: function(feature, layer) {
      var popupText = "<strong>CBI</strong>: " + feature.properties.nombre_cb;
      layer.bindPopup(popupText);
    }
	
  }).addTo(mapa);

  control_capas.addOverlay(capa_limite , 'Límite CBIMA');


});	
// Capa vectorial trama verde en formato GeoJSON
$.getJSON("https://francini-ap.github.io/datos_tarea02/tramaverde/tramaverde_cbima.geojson", function(geodata) {
  var capa_tramaverde = L.geoJson(geodata, {
    style: function(feature) {
	  return {'color': " #8cf00d  ", 'weight': 1.5, 'fillOpacity': 0.0}
    },
    onEachFeature: function(feature, layer) {
      var popupText = "<strong>Categoría</strong>: " + feature.properties.categoria+ "<br>" + "<strong>Clase</strong>: " + feature.properties.clase;
      layer.bindPopup(popupText);
    }			
  }).addTo(mapa);

  control_capas.addOverlay(capa_tramaverde , 'Trama verde');

});

// Ícono personalizado para calidad agua
const iconoCalidadagua = L.divIcon({
  html: '<i class="fas fa-tint fa-1.5x"></i>',
  className: 'estiloIconos'
});

// Ícono personalizado para desfogues
const iconodesfogues = L.divIcon({
  html: '<i class="fas fa-exclamation-triangle fa-1.5x"></i>',
  className: 'estiloIconos2'
});


// Control de capas
control_capas = L.control.layers(capas_base).addTo(mapa);	


// Control de escala
L.control.scale().addTo(mapa);

   
// Capa vectorial de registros agrupados de calidad agua
$.getJSON("https://francini-ap.github.io/datos_tarea04/calidad_agua.geojson", function(geodata) {
  // Capa de registros individuales
  var capa_calidad_agua = L.geoJson(geodata, {
    style: function(feature) {
	  return {'color': "#013220", 'weight': 2}
    },
    onEachFeature: function(feature, layer) {
      var popupText = "<strong>Punto muestreo</strong>: " + feature.properties.pts_muestr + "<br>" + 
	                  "<br>" +
                      "<strong>Categoría</strong>: " + feature.properties.categoria + "<br>" + 
					  "<br>" +
                      "<strong>Índice BMWP (época lluviosa)</strong>: " + feature.properties.CatBMWPM1 + "<br>" + 
					  "<br>" + 
                      "<strong>Índice BMWP (época seca)</strong>: " + feature.properties.CatBMWPM2 + "<br>";
                      
      layer.bindPopup(popupText);
    },
    pointToLayer: function(getJsonPoint, latlng) {
        return L.marker(latlng, {icon: iconoCalidadagua});
    }
  });
  
  // Capa de calor (heatmap)
  coordenadas = geodata.features.map(feat => feat.geometry.coordinates.reverse());
  var capa_calidad_agua_calor = L.heatLayer(coordenadas, {radius: 80, blur: 1, gradient: {0.4:'blue', 0.5:'orange', 1:'red' }});

  // Capa de puntos agrupados
  var capa_calidad_agua_calor_agrupados = L.markerClusterGroup({spiderfyOnMaxZoom: true});
  capa_calidad_agua_calor_agrupados.addLayer(capa_calidad_agua);

  // Se añaden las capas al mapa y al control de capas
  capa_calidad_agua_calor.addTo(mapa);
  control_capas.addOverlay(capa_calidad_agua_calor, 'Mapa de calor calidad agua');
  // capa_calidad_agua_calor_agrupados.addTo(mapa);
  control_capas.addOverlay(capa_calidad_agua_calor_agrupados, 'Registros agrupados calidad agua');
  // capa_calidad_agua.addTo(mapa);
  control_capas.addOverlay(capa_calidad_agua, 'Registros individuales puntos calidad agua');
});



// Capa vectorial de registros agrupados de  desfogues y basureros
$.getJSON("https://francini-ap.github.io/datos_tarea04/desfogues_basureros.geojson", function(geodata) {
  // Capa de registros individuales
  var capa_desfogues = L.geoJson(geodata, {
    style: function(feature) {
	  return {'color': "#013220", 'weight': 3}
    },
    onEachFeature: function(feature, layer) {
      var popupText = "<strong>Nombre</strong>: " + feature.properties.Name + "<br>" + 
	                  "<br>" +
                      "<strong>Presenta olor</strong>: " + feature.properties.OLOR + "<br>" + 
					  "<br>" +
                      "<strong>Estado</strong>: " + feature.properties.ESTADO + "<br>";
					  
                      
      layer.bindPopup(popupText);
    },
    pointToLayer: function(getJsonPoint, latlng) {
        return L.marker(latlng, {icon: iconodesfogues});
    }
  });
  
  // Capa de puntos agrupados
  var capa_calidad_agua_calor_agrupados = L.markerClusterGroup({spiderfyOnMaxZoom: true});
  capa_calidad_agua_calor_agrupados.addLayer(capa_desfogues);

  // capa_calidad_agua_calor_agrupados.addTo(mapa);
  control_capas.addOverlay(capa_calidad_agua_calor_agrupados, 'Registros agrupados desfogues');
  // capa_desfogues.addTo(mapa);
  control_capas.addOverlay(capa_desfogues, 'Registros individuales de desfogues');
});

// Capa raster: isotermalidad
var capa_isotermalidad = L.imageOverlay("datos/3.png", 
	[[11.2159328521757722, -87.0970108884774277], 
	[5.4999767512137714, -82.5539392861543888]], 
	{opacity:0.5}
).addTo(mapa);
control_capas.addOverlay(capa_isotermalidad , 'Isotermalidad');

// Capa raster: datos tem diurna media
var capa_temp_diurna = L.imageOverlay("datos/2.png", 
	[[11.2159328521757722, -87.0970108884774277], 
	[5.4999767512137714, -82.5539392861543888]], 
	{opacity:0.5}
).addTo(mapa);
control_capas.addOverlay(capa_temp_diurna , 'Temperatura Diurna media');

// Agregar capa WMS
   var capa_distritos = L.tileLayer.wms('http://geos.snitcr.go.cr/be/IGN_5/wms?', {
	  layers: 'limitedistrital_5k',
	  format: 'image/png',
	  transparent: true
	}).addTo(mapa);

// Se agrega al control de capas como de tipo "overlay"
control_capas.addOverlay(capa_distritos, 'Distritos');

