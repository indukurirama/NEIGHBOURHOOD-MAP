

var initStatistics = [
  {
    title: 'Apple Hospitals',
    lat: 16.754935,
    lng: 81.674549
  },
  {
    title: 'The Andhra Sugars Limited',
    lat: 16.740581,
    lng: 81.674094
  },
  {
    title: 'Gowthami Solvent Oils Limited ( spinning division)',
    lat: 16.765003,
    lng: 81.668860
  },
  {
    title: 'Hotel Chitturi Heritage',
    lat: 16.753837,
    lng: 81.689948
  },
  {
    title: 'S.M.V.M Polytechnic',
    lat: 16.754782,
    lng: 81.678040
  },
  {
    title: 'SKSD Mahila Kalasala',
    lat: 16.7518374,
    lng: 81.6955677
  },
  {
    title: 'Mullapudi Harischandra prasad Kamma Kalyana Mandapam',
    lat: 16.766517,
    lng: 81.678370
  }
];


onGMapsError = function() {
  alert('There was an error occured with the Google Maps. Please try again later.');
};

var CLIENT_ID = 'UTKAON5Y1VK1UZ11YRBE1FISHNYV2V0WTB2YYHCMLRQYOPHP';
var CLIENT_SECRET = '1VOW1ZGEZPXWL2WRZBP5OCAEN5ZMKSOBIH2DL2CLQEJOND5I';


var openedModalBox = null;
var map;
var latestMarker = null;

var Location = function(jobsw) {
  var find = this;

  find.title = jobsw.title;
  find.searchTitle = jobsw.title.toLowerCase();

  var url = 'https://api.foursquare.com/v2/venues/search?v=20161016&ll='
    + jobsw.lat + ',' + jobsw.lng + '&intent=global&query=' + jobsw.title
    + '&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET;

  $.getJSON(url).done(function(data) {
    var data = data.response.venues[0];
  }).fail(function() {
    alert('There was an error occured with the Foursquare API. Please try again later.');
  });


  find.marker = new google.maps.Marker({
    map: map,
    position: new google.maps.LatLng(jobsw.lat, jobsw.lng),
    title: find.title
  });

  find.marker.addListener('click', function() {
    // close opened infoWindow
    if (openedModalBox) {
      openedModalBox.close();
    }

    var cancelAnimation = function() {
      latestMarker.setAnimation(null);
      latestMarker = null;
    };

    if (latestMarker) {
      cancelAnimation();
    }

    var infoWindowContentData = [
      '<div class="info-window">',
        '<h4>', find.title, '</h4>',
      '</div>'
    ];
    var infoWindow = new google.maps.InfoWindow({ content: infoWindowContentData.join('') });
    openedModalBox = infoWindow;

    infoWindow.open(map, find.marker);
    find.marker.setAnimation(google.maps.Animation.BOUNCE);
    latestMarker = find.marker;

    google.maps.event.addListener(infoWindow, 'closeclick', cancelAnimation);
  });

  find.selectLocation = function() {
    google.maps.event.trigger(find.marker, 'click');
  };

};


var AppViewModel = function() {
  var find = this;

  this.searchText = ko.observable('');
  this.locationsList = ko.observableArray();

  map = new google.maps.Map(document.getElementById('mapDiv'), {
    center: { lat: 16.754782, lng: 81.678040 },
    zoom: 14
  });

  initStatistics.forEach(function(datum) {
    var location = new Location(datum);
    find.locationsList.push(location);
  });

  this.filteredList = ko.computed(function() {
    return this.locationsList().filter(function(location) {
      var isMatched = location.searchTitle.indexOf(this.searchText().toLowerCase()) !== -1;
      location.marker.setVisible(isMatched);

      return isMatched;
    }, this);
  }, this);
};

function init() {
  ko.applyBindings(new AppViewModel());
}
