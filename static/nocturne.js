$(function() {
  var TORONTO = [43.6520, -79.3900];
  var map = L.map('map').setView(TORONTO, 14);

  L.tileLayer(
    'https://{s}.tiles.mapbox.com/v3/foodmaap.jpid9gik/{z}/{x}/{y}.png', {
    attribution: '<a href="http://www.mapbox.com/about/maps/" ' +
                 'target="_blank">Terms &amp; Feedback</a>'
  }).addTo(map);

  $.ajax({
    url: 'api/v1/locations',
    success: function(response) {
      for (var i = 0; i < response.data.length; i++) {
        var location = response.data[i];
        L.marker([location.latitude, location.longitude]).addTo(map);
      }
    }
  });
});
