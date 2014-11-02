$(function() {
  /*
   * Initialization
   */
  var TORONTO = [43.6520, -79.3900];
  var map = L.map('map').setView(TORONTO, 14);

  L.tileLayer(
    'https://{s}.tiles.mapbox.com/v3/foodmaap.jpid9gik/{z}/{x}/{y}.png', {
    attribution: '<a href="http://www.mapbox.com/about/maps/" ' +
                 'target="_blank">Terms &amp; Feedback</a>'
  }).addTo(map);

  /*
   * Main API call
   */
  $.ajax({
    url: 'api/v1/locations',
    success: function(response) {
      for (var i = 0; i < response.data.length; i++) {
        var place = response.data[i];
        var pin = L.marker([place.latitude, place.longitude]).addTo(map);
        pin
          .bindPopup("<b>Hello world!</b><br>I am a popup.")
          .openPopup();
      }
    }
  });

  /*
   * Helpers
   */
});
