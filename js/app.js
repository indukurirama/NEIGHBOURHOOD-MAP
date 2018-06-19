
var initStatistics = [
	{
		name: 'Taj Mahal Palace',
		lat: 18.9217291,
		lng: 72.8308422
	  },
	  {
		name: 'Nariman Point',
		lat: 18.9247894,
		lng: 72.8188995
	  },
	  {
		name: 'Worli Sea Face',
		lat: 19.0089742,
		lng: 72.8067542
	  },
	  {
		name: 'Joggers Park',
		lat: 19.0630622,
		lng: 72.8505227
	  },
	  {
		name: 'Candies',
		lat: 19.0707428,
		lng: 72.821503
	  },
	  {
		name: 'Wankhede Stadium',
		lat: 18.9389414,
		lng: 72.8235859
	  },
	  {
		name: 'Cafe Madras',
		lat: 19.027647,
		lng: 72.8528684
	  }
];


// Declaring global variables now to satisfy strict mode
var graph;
var clientID;
var clientSecret;
var Location = function(data) {
	var self = this;
	this.name = data.name;
	this.lat = data.lat;
	this.lng = data.lng;
	this.URL = "";
	this.street = "";
	this.city = "";
	this.phone = "";
      

	this.visible = ko.observable(true);
       

	var foursquareURL = 'https://api.foursquare.com/v2/venues/search?ll='+ this.lat + ',' + this.lng + '&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20160118' + '&query=' + this.name;

	$.getJSON(foursquareURL).done(function(data) {
		var requests =data.response.venues[0];
		
	self.street = requests.location.formattedAddress[0];
     	self.city = requests.location.formattedAddress[1];
      	
	}).fail(function() {
		alert("There was an error with the Foursquare API call. Please refresh the page to load Foursquare data.");
	});

	this.contentString = '<div class="info-window-content"><div class="title"><b>' + data.name + "</b></div>" +
        '<div class="content">' + self.street + "</div>" +
        '<div class="content">' + self.city + "</div>";
// create a infowindow to display information about locations.
	this.infoWindow = new google.maps.InfoWindow({content: self.contentString});

	this.marker = new google.maps.Marker({
			position: new google.maps.LatLng(data.lat, data.lng),
			graph: graph,
			title: data.name
	});

	this.showMarker = ko.computed(function() {
		if(this.visible() === true) {
			this.marker.setMap(graph);
		} else {
			this.marker.setMap(null);
		}
		return true;
	}, this);

	this.marker.addListener('click', function(){
		self.contentString = '<div class="info-window-content"><div class="title"><b>' + data.name + "</b></div>" +
        '<div class="content">' + self.street + "</div>" +
        '<div class="content">' + self.city + "</div>" ;

        self.infoWindow.setContent(self.contentString);

		self.infoWindow.open(graph, this);

		self.marker.setAnimation(google.maps.Animation.BOUNCE);
      	setTimeout(function() {
      		self.marker.setAnimation(null);
     	}, 2100);
	});

	this.bounce = function(place) {
		google.maps.event.trigger(self.marker, 'click');
	};
};

function AppViewModel() {
	var self = this;

	this.searchTerm = ko.observable("");

	this.locationList = ko.observableArray([]);
        

	graph = new google.maps.Map(document.getElementById('map'), {
			zoom: 10.8,
			center: {lat: 19.027647, lng: 72.8528684}
	});

	// Foursquare API settings
	clientID = "UTKAON5Y1VK1UZ11YRBE1FISHNYV2V0WTB2YYHCMLRQYOPHP";
	clientSecret = "1VOW1ZGEZPXWL2WRZBP5OCAEN5ZMKSOBIH2DL2CLQEJOND5I";

	initStatistics.forEach(function(locationItem){
		self.locationList.push( new Location(locationItem));
	});

	this.filteredList = ko.computed( function() {
		var filter = self.searchTerm().toLowerCase();
		if (!filter) {
			self.locationList().forEach(function(locationItem){
				locationItem.visible(true);
			});
			return self.locationList();
		} else {
			return ko.utils.arrayFilter(self.locationList(), function(locationItem) {
				var string = locationItem.name.toLowerCase();
				var output = (string.search(filter) >= 0);
				locationItem.visible(output);
				return output;
			});
		}
	}, self);

	this.mapElem = document.getElementById('map');
	this.mapElem.style.height = window.innerHeight - 50;
}

function startApp() {
	ko.applyBindings(new AppViewModel());
}


function errorHandling() {
	alert("Google Maps has failed to load. Please check your internet connection.");
}
