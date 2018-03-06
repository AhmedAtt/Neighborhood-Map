var locations = [{
    title: 'Egyptian Museum',
    location: {
      lat: 30.047778,
      lng: 31.233333
    },
    wpPhrase: 'Egyptian_Museum'

  },
  {
    title: 'Tahrir Square',
    location: {
      lat: 30.0444,
      lng: 31.2357
    },
    wpPhrase: 'Tahrir_Square'
  },
  {
    title: 'Qasr El Nil Bridge',
    location: {
      lat: 30.043747,
      lng: 31.229464
    },
    wpPhrase: 'Qasr_El_Nil_Bridge'
  },
  {
    title: 'Cairo Tower',
    location: {
      lat: 30.045833,
      lng: 31.224444
    },
    wpPhrase: 'Cairo_Tower'
  },
  {
    title: 'Cairo Opera House',
    location: {
      lat: 30.04245,
      lng: 31.22353
    },
    wpPhrase: 'Cairo_Opera_House'
  },
];
var map;
var markersArr = [];

//intializing the Map
//==============================================================================
function initMap() {
  var self = this;
  map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: 30.045833,
      lng: 31.224444
    },
    zoom: 14
  });
  //add Marker for each location;
  for (var i = 0; i < locations.length; i++) {
    addMarker(i);
  }
}
//==============================================================================


//add the marker of the location with locationId to the map
//the marker is placed with it's window containing data about the location
//from wikipedia
function addMarker(locationId) {
  var marker = new google.maps.Marker({
    position: locations[locationId].location,
    map: map,
    title: locations[locationId].title
  });

  //function based on Tutorial http://www.9bitstudios.com/2014/03/getting-data-from-the-wikipedia-api-using-jquery/
  function getInfoWindowContent() {

    var targetURL = "http://en.wikipedia.org/w/api.php?action=parse&format=json&prop=text&section=0&page=" + locations[locationId].wpPhrase + "&callback=?";
    $.ajax({
      type: "GET",
      url: targetURL,
      contentType: "application/json; charset=utf-8",
      async: false,
      dataType: "json",
      success: function(data, textStatus, jqXHR) {
        var markup = data.parse.text["*"];
        var blurb = $('<div></div>').html(markup);

        // remove links as they will not work
        blurb.find('a').each(function() {
          $(this).replaceWith($(this).html());
        });

        // remove any references
        blurb.find('sup').remove();

        // remove cite error
        blurb.find('.mw-ext-cite-error').remove();
        var retString = $(blurb).find('p');
        var title = locations[locationId].title;
        var contentString = '<div id="content">' +
          '<div id="siteNotice">' +
          '</div>' +
          '<h1 id="firstHeading" class="firstHeading">' + title + '</h1>' +
          '<div id="bodyContent">' +
          '<p>' + $(retString).text() + '</p>' +
          '<p>Attribution:<a href="https://en.wikipedia.org/w/index.php?title=' + locations[locationId].wpPhrase + '">' +
          'https://en.wikipedia.org/w/index.php?title=' + locations[locationId].wpPhrase + '</a>' +
          '</p>' +
          '</div>' +
          '</div>';
        marker.infowindow = new google.maps.InfoWindow({
          //content: $(retString).text()
          content: contentString
        });
        // marker.addListener('mouseover', function() {
        //   this.infowindow.open(map, this);
        // });
        // marker.addListener('mouseout', function() {
        //   this.infowindow.close(map, this);
        // });
      },
      error: function(errorMessage) {
        console.log(errorMessage);
      }
    });
  };
  getInfoWindowContent();
  addMarkersAnimations(marker);
  markersArr.push(marker);
}
//Handle ALl Markers Events
//=============================================================================
function addMarkersAnimations(marker){

  //on mouse over show info window
  marker.addListener('mouseover', function() {
    this.infowindow.open(map, this);
  });
  //on mouse out hide info window
  marker.addListener('mouseout', function() {
    this.infowindow.close(map, this);
  });

  //if marker is clicked trigger bounce with time out
  marker.addListener('mouseover', toggleBounce);
  function toggleBounce() {
    if (marker.getAnimation() !== null) {
      marker.setAnimation(null);
    } else {
      marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function() {
        marker.setAnimation(null);
      }, 3500);
    }
  }

}
//=============================================================================
//MVVC part with knockoutJs
//=============================================================================
$(document).ready(function() {

  //function to show all markers
  function showAllMarkers() {
    markersArr.forEach(function(marker) {
      marker.setVisible(true);
      animateMarker(marker);
    });
  }
  //function to hide al markers
  function hideAllMarkers() {
    markersArr.forEach(function(marker) {
      marker.setVisible(false);
    });
  }

  var MapViewModel = {
    query: ko.observable(""),
    locationList: ko.observableArray(locations)
  };


  //Got help for this filter function from
  //https://stackoverflow.com/questions/20857594/knockout-filtering-on-observable-array


  MapViewModel.filteredLocations = ko.computed(function() {
    hideAllMarkers();
    var filter = this.query().toLowerCase();
    if (!filter) {
      showAllMarkers();
      return this.locationList();
    } else {
      return ko.utils.arrayFilter(MapViewModel.locationList(), function(loc) {
        if (loc.title.toLowerCase().indexOf(filter) >= 0) {
          //show only the markers with names matching the search query
          markersArr[locations.indexOf(loc)].setVisible(true);
          animateMarker(markersArr[locations.indexOf(loc)]);
        }
        return loc.title.toLowerCase().indexOf(filter) >= 0;
      });
    }
  }, MapViewModel);
  ko.applyBindings(MapViewModel);
});

//when a location is clicked from the nav bar animation is triggered
function focusOnMarker(event){
  markersArr.forEach(function(marker){
      if(marker.title==event.target.text){
        animateMarker(marker);
        marker.infowindow.open(map,marker);
      }


  });

}
//=============================================================================
//function to trigger animation for marker
function animateMarker(mrkr) {
  mrkr.setAnimation(google.maps.Animation.BOUNCE);
  setTimeout(function() {
    mrkr.setAnimation(null);
  }, 3500);
}


function openNav() {
  document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
}
