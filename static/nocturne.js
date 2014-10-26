var map = L.map('map').setView([42.3610, -71.0587], 15);

L.tileLayer('https://{s}.tiles.mapbox.com/v3/foodmaap.jpid9gik/{z}/{x}/{y}.png', {
  attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>'
}).addTo(map);
