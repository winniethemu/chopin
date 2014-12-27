var NocturneMarker = L.Marker.extend({
  options: {
    image_url: '',
    like_count: 0,
    link: '',
    name: '',
    recent_posts: []
  }
});

$(function() {
  var TORONTO = [43.6500, -79.3900];
  var map = L.map('map').setView(TORONTO, 14);
  var detailsTmpl = doT.template($('#details').html());
  var geoOptions = {
    // enableHighAccuracy: true,
    maxAge: 5 * 60 * 1000,
    timeout: 10 * 1000
  };

  L.Icon.Default.imagePath = 'images';
  L.tileLayer(
    'https://{s}.tiles.mapbox.com/v3/foodmaap.d30c6747/{z}/{x}/{y}.png', {
    attribution: '<a href="http://www.mapbox.com/about/maps/" ' +
                 'target="_blank">Terms &amp; Feedback</a>'
  }).addTo(map);

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(geoSuccess, geoError, geoOptions);
  }

  $.ajax({
    url: 'api/v1/locations',
    success: function(response) {
      for (var i = 0; i < response.data.length; i++) {
        var locationInfo = response.data[i];

        var pin = new NocturneMarker(
            [locationInfo.latitude, locationInfo.longitude], {
          author: locationInfo.author,
          caption: locationInfo.caption,
          image_url: locationInfo.image_url,
          like_count: locationInfo.like_count,
          link: locationInfo.link,
          name: locationInfo.name,
          recent_posts: locationInfo.recent_posts
        }).addTo(map);

        pin.on('click', showPlaceDetails);
      }
    }
  });

  function geoSuccess(position) {
    console.log(position.coords.latitude);
    console.log(position.coords.longitude);
  };

  function geoError(position) {
    console.log('Error occurred. Error code: ' + error.code);
    // error.code can be:
    //   0: unknown error
    //   1: permission denied
    //   2: position unavailable (error response from location provider)
    //   3: timed out
  };

  function showPlaceDetails(e) {
    var data = e.target.options;
    $('#details-wrapper').html(detailsTmpl(data));
  }

  $('#btn-shrink').on('click', function() {
    $('#details-wrapper')
      .animate({ width: '-=500', height: '-=200' }, 200)
      .css('padding', 0);
    $(this).fadeOut();
    $('#btn-expand').fadeIn();
  });

  $('#btn-expand').on('click', function() {
    $('#details-wrapper')
      .animate({ width: '+=500', height: '+=200' }, 200)
      .css('padding', '10px');
    $(this).fadeOut();
    $('#btn-shrink').fadeIn();
  });
});
