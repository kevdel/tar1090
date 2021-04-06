const logBtn = document.getElementById('log');
logBtn.addEventListener('click', fetchData);

var map = new ol.Map({
        target: 'map',
        layers: [
          new ol.layer.Tile({
            source: new ol.source.OSM()
          })
        ],
        view: new ol.View({
          center: ol.proj.fromLonLat([-31,49]),
          zoom: 4
        })
      });

async function fetchData() {

    const response = await fetch('https://tracks.ganderoceanic.com/data');
    const data = await response.json();

    const nowSecs = Date.now();

    if(!data.length < 3) // simple length check to handle any empty api response
    {

    var gj = {
       "name":"North Atlantic Tracks",
       "type":"FeatureCollection",
       "features":[]
    };

    for(i=0; i < data.length; i++) {
     nowUTCSeconds = nowSecs + new Date().getTimezoneOffset()*60;
     trackValidFrom = data[i].validFrom*1000;
     trackValidTo = data[i].validTo*1000;
     trackID = data[i].id;
     trackTMI = data[i].tmi;
     trackDirection =  (data[i].direction == 1) ? "Eastbound"  : "Westbound";
     trackFlightLevels = data[i].flightLevels;
     trackInfo = `Track ${trackID} (tmi - ${trackTMI}) ${trackDirection} at flight levels ${trackFlightLevels}`;
     trackInfo += `\nEntry ${data[i].route[0].name} Exit ${data[i].route[data[i].route.length-1].name}`;
     trackInfo += `\nStarts ${new Date(trackValidFrom).toISOString()}`;
     trackInfo += `\nExpires ${new Date(trackValidTo).toISOString()}`;

     console.log(trackInfo);


      // pull out the track information
      // only create the currently active track
     if(! ((trackValidTo > nowUTCSeconds) && (nowUTCSeconds > trackValidFrom))) {
       console.log("Skipping non active track " + trackID);
       continue;
     }


     gj.features.push({"type":"Feature","properties": {},"geometry":{"type": "LineString","coordinates": []}});
     var x = gj.features.length;

     gj.features[x-1]["properties"] = {"name": trackDirection + " Track: " + trackID};

     //loop all the route sections and add
     for(y=0; y < data[i].route.length; y++)
     {
       gj.features[x-1].geometry.coordinates.push([data[i].route[y].longitude, data[i].route[y].latitude]);
     }
     map.addLayer(createGeoJsonLayerNonUrl("North Atlantic Tracks", 'nats', gj, 'rgba(22, 171, 22, 0.3)', 'rgba(22, 171, 22, 1)'));

     }
    }
    else {
     alert("No track information available");
    }
}

let createGeoJsonLayerNonUrl = function (title, name, geojson, fill, stroke, showLabel = true) {
        return new ol.layer.Vector({
            type: 'overlay',
            title: title,
            name: name,
            zIndex: 99,
            visible: true,
            source: new ol.source.Vector({
              features: (new ol.format.GeoJSON()).readFeatures(geojson,{featureProjection: 'EPSG:3857'})
            }),

            style: function style(feature) {
                return new ol.style.Style({
                    fill: new ol.style.Fill({
                        color : "#000000"
                    }),
                    stroke: new ol.style.Stroke({
                        color: stroke,
                        width: 1
                    }),
                    text: new ol.style.Text({
                        text: showLabel ? feature.get("name") : "etruer",
                        overflow: map.getView().getZoom() > 5,
                        scale: 1.25,
                        fill: new ol.style.Fill({
                            color: '#000000'
                        }),
                        stroke: new ol.style.Stroke({
                            color: '#FFFFFF',
                            width: 2
                        })
                    })
                });
            }
        });

}
