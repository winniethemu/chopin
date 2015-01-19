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
  var $map = $("#map");
  var currentCity = [$map.data("latitude"), $map.data("longitude")];
  var map = L.map("map").setView(currentCity, 14);
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
    'https://{s}.tiles.mapbox.com/v3/foodmaap.l0153oc9/{z}/{x}/{y}.png', {
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
        longitudes.push(locationInfo.longitude);
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

  map.on("moveend", showOutOfBoundsTips);

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

  function outOfBoundsCount(bounds) {
    var count = { north: 0, east: 0, south: 0, west: 0 };
    var northBound = bounds.getNorth();
    var eastBound = bounds.getEast();
    var southBound = bounds.getSouth();
    var westBound = bounds.getWest();

    for (var i = 0; i < latitudes.length; i++) {
      if (northBound < latitudes[i]) {
        count.north++;
      }
      if (southBound > latitudes[i]) {
        count.south++;
      }
    }

    for (var j = 0; j < longitudes.length; j++) {
      if (eastBound < longitudes[j]) {
        count.east++;
      }
      if (westBound > longitudes[j]) {
        count.west++;
      }
    }

    return count;
  }

  function showOutOfBoundsTips() {
    var bounds = map.getBounds();
    var count = outOfBoundsCount(bounds);

    if (count.north) {
      $("#tip-north .tip-count").html(count.north);
      $("#tip-north").fadeIn();
    } else {
      $("#tip-north").fadeOut();
    }

    if (count.east) {
      $("#tip-east .tip-count").html(count.east);
      $("#tip-east").fadeIn();
    } else {
      $("#tip-east").fadeOut();
    }

    if (count.south) {
      $("#tip-south .tip-count").html(count.south);
      $("#tip-south").fadeIn();
    } else {
      $("#tip-south").fadeOut();
    }

    if (count.west) {
      $("#tip-west .tip-count").html(count.west);
      $("#tip-west").fadeIn();
    } else {
      $("#tip-west").fadeOut();
    }
  }
});
