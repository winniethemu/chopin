var NocturneMarker = L.Marker.extend({
  options: {
    image_url: "",
    like_count: 0,
    link: "",
    name: "",
    recent_posts: []
  }
});

$(function() {
  var TORONTO = [43.6500, -79.3900];
  var map = L.map("map").setView(TORONTO, 14);
  var detailsTmpl = doT.template($("#details").html());
  var latitudes = [];
  var longitudes = [];
  var geoOptions = {
    // enableHighAccuracy: true,
    maxAge: 5 * 60 * 1000,
    timeout: 10 * 1000
  };

  L.Icon.Default.imagePath = "images";
  L.tileLayer(
    'https://{s}.tiles.mapbox.com/v3/foodmaap.d30c6747/{z}/{x}/{y}.png', {
    attribution: '<a href="http://www.mapbox.com/about/maps/" ' +
                 'target="_blank">Terms &amp; Feedback</a>'
  }).addTo(map);

  $.ajax({
    url: "api/v1/locations",
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

        latitudes.push(locationInfo.latitude);
        longitudes.push(locationInfo.longitudes);
        pin.on("click", showLocationDetails);
      }

      showOutOfBoundsTips();
    }
  });

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(geoSuccess, geoError, geoOptions);
  }

  $(document).on("click", function(e) {
    var $el = $(e.target);

    if ($el.closest("#details-wrapper").length < 1) {
      $("#details-wrapper").fadeOut(200);
    }
  });

  function geoSuccess(position) {
    console.log(position.coords.latitude);
    console.log(position.coords.longitude);
  };

  function geoError(position) {
    console.log("Error occurred. Error code: " + error.code);
    // error.code can be:
    //   0: unknown error
    //   1: permission denied
    //   2: position unavailable (error response from location provider)
    //   3: timed out
  };

  function showLocationDetails(e) {
    var data = e.target.options;

    $("#details-wrapper").html(detailsTmpl(data)).fadeIn();
  }

  function outOfBoundsCount(bounds, direction) {
    var bound;
    var count = 0;

    if (direction === "NORTH") {
      bound = bounds.getNorth();
      for (var i = 0; i < latitudes.length; i++) {
        if (bound < latitudes[i]) {
          count++;
        }
      }
    } else if (direction === "EAST") {
      bound = bounds.getEast();
      for (var j = 0; j < latitudes.length; j++) {
        if (bound < longitudes[j]) {
          count++;
        }
      }
    } else if (direction === "SOUTH") {
      bound = bounds.getSouth();
      for (var k = 0; k < latitudes.length; k++) {
        if (bound > latitudes[k]) {
          count++;
        }
      }
    } else {
      // direction === "WEST"
      bound = bounds.getWest();
      for (var l = 0; l < latitudes.length; l++) {
        if (bound > longitudes[l]) {
          count++;
        }
      }
    }
    return count;
  }

  function showTip(count, direction) {
    if (direction === "NORTH") {
      $("#tip-north .tip-count").html(count);
      $("#tip-north").show();
    } else if (direction === "EAST") {
      $("#tip-east .tip-count").html(count);
      $("#tip-east").show();
    } else if (direction === "SOUTH") {
      $("#tip-south .tip-count").html(count);
      $("#tip-south").show();
    } else {
      // direction === "WEST"
      $("#tip-west .tip-count").html(count);
      $("#tip-west").show();
    }
  }

  function showOutOfBoundsTips() {
    var directions = ['NORTH', 'EAST', 'SOUTH', 'WEST'];
    var bounds = map.getBounds();

    for (var i = 0; i < directions.length; i++) {
      var count = outOfBoundsCount(bounds, directions[i]);
      if (count) {
        showTip(count, directions[i]);
      }
    }
  }
});
