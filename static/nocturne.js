L.mapbox.accessToken = 'pk.eyJ1IjoiZm9vZG1hYXAiLCJhIjoid1VTdVZTdyJ9.ObzX5yN1zDpYjsJGrCK35g';

var mapboxTiles = L.tileLayer('https://{s}.tiles.mapbox.com/v3/foodmaap.jpid9gik/{z}/{x}/{y}.png', {
  attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>'
});

var map = L.map('map')
            .addLayer(mapboxTiles)
            .setView([42.3610, -71.0587], 15);
