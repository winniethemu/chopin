var mapboxTiles = L.tileLayer('https://{s}.tiles.mapbox.com/v3/foodmaap.jpid9gik/{z}/{x}/{y}.png', {
  attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>'
});

var map = L.map('map')
            .addLayer(mapboxTiles)
            .setView([42.3610, -71.0587], 15);

function onMapClick(e) {
      alert("You clicked the map at " + e.latlng);
}

map.on('click', onMapClick);
