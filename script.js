BASE_URL = "https://app.ticketmaster.com/discovery/v2/events.json?size=190&apikey=";
API_KEY = "27mLqO6JmMfWlES8MKnMVG1tkm75I9cE";
URL = BASE_URL + API_KEY;
//https://app.ticketmaster.com/discovery/v2/events.json?apikey=27mLqO6JmMfWlES8MKnMVG1tkm75I9cE

//Global? variables
let map;
let detailed_map;
const TORONTO = {lat: 43.641409, lng: -79.389367};
let markers = [];
let detailed_markers=[];
let current_view_type = "listing_view";
let current_events = [];
let scroll=0;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 8,
        center: TORONTO
    });

   $("#map_view").hide();
   initDetailedMap();
   
}

function initDetailedMap() {
    detailed_map = new google.maps.Map(document.getElementById('detailed_map'), {
        zoom: 8,
        center: TORONTO
    });

   $("#detailed_map_view").hide();
}

function detailed_view(id){

    var url_string= "https://app.ticketmaster.com/discovery/v2/events/" + id + ".json?apikey=27mLqO6JmMfWlES8MKnMVG1tkm75I9cE" ;


    //https://app.ticketmaster.com/discovery/v2/events.json?size=5&apikey=27mLqO6JmMfWlES8MKnMVG1tkm75I9cE
    $.ajax({
        type:"GET",
        url:url_string , //"https://app.ticketmaster.com/discovery/v2/events/G5diZfkn0B-bh.json?apikey=27mLqO6JmMfWlES8MKnMVG1tkm75I9cE",
        async:true,
        dataType: "json",
        success: function(json) {
            $("#eventName").html(json.name);

            if( Object.prototype.hasOwnProperty.call(json, 'images')){
                if(json.images.length > 0){
                    let src= "<img src=" + json.images[1].url+ " width=\"85%\" height=\"40%\">";
                    $("#images").html(src);
                }
            }
            
            if( Object.prototype.hasOwnProperty.call(json, 'dates')){
                $("#eventDate").html("Date: " + json.dates.start.localDate);
                $("#startTime").html("Start Time: " + json.dates.start.localTime);
            }
            //$("#endTime").html("End Time: " + json.dates.end.localTime);
            if( Object.prototype.hasOwnProperty.call(json, 'promoter')){

                $("#promoter").html("Event promoter: " + json.promoter.name);
            //$("#promoter").html("Event promoter: " + json.description);
            }
            
            
           if( Object.prototype.hasOwnProperty.call(json, 'priceRanges')){
                if(json.priceRanges.length > 0){
                    var price_range = "Ticket Price Range: " + json.priceRanges[0].currency + " " + json.priceRanges[0].min + " - " + json.priceRanges[0].max;
                    $("#priceRange").html(price_range);
                }
            }

             if( Object.prototype.hasOwnProperty.call(json, '_embedded')){
                if(json._embedded.venues.length > 0){
                    $("#venue").html("Venue: " + json._embedded.venues[0].name);
                    $("#venue_address").html("Address: " +
                        json._embedded.venues[0].address.line1 + ", " +
                        json._embedded.venues[0].city.name + ", " +
                        json._embedded.venues[0].postalCode + " " +
                        json._embedded.venues[0].country.name);
                }
            }
                //for(var i=0; i<json.priceRanges.length; i++){
                //    price_range = price_range + json.priceRanges[i];
                //}

           

            $( "#eventDetails" ).removeClass( "hidden" );
             $("#detailed_map_view").show();
              $('#detailed_map_view').removeClass("animated flipInX").addClass("animated flipInX");
            
            for (marker of detailed_markers)
                    marker.setMap(null);
            detailed_markers = [];
            google.maps.event.trigger(detailed_map, 'resize');
            var centre;
            if((typeof (json._embedded.venues[0].location) != "undefined") && (typeof (json._embedded.venues[0].location.latitude) != "undefined") && (typeof (json._embedded.venues[0].location.longitude) != "undefined") ){
                
            	centre= {lat: parseFloat(json._embedded.venues[0].location.latitude), lng:parseFloat(json._embedded.venues[0].location.longitude)};
            
		        detailed_map.setCenter(centre);
		        
		        detailed_markers.push(new google.maps.Marker({
                        position: new google.maps.LatLng(parseFloat(json._embedded.venues[0].location.latitude),
							 parseFloat(json._embedded.venues[0].location.longitude)),
                        map: detailed_map
                    }));
            }
            else{
                 detailed_map.setCenter(TORONTO);
            }
            
        },
        error: function(xhr, status, err) {
            // This time, we do not end up here!
            alert("error happened and status is");
            alert(status);

        }
    });
}

function listing_view(events) {
        
    current_events = events;
        for(let i=0; i<events.length; i++) {
            $("#events_list").append(
                `<a  class="list-group-item animated flipInX" id="${events[i].id}">
                    <p>${events[i].name}<br>
                       ${events[i].dates.start.localDate} @${events[i].dates.start.localTime}<p/>
                 </a>`);

	        $("#"+events[i].id).click(() => {
                scroll = $(window).scrollTop();
	            clear_view();
	            change_view("detailed_view", events[i].id);
				
				current_row = events[i].id;
	        });
        }

	if(scroll!=0){
			$(window).scrollTop(scroll);
		    scroll=0;
		}    
}

function map_view (events) {
    current_events = events;
    let venue_locations = [];
	
    for (let i=0; i<events.length;i++) {
        if((typeof (events[i]._embedded.venues) != "undefined")){
		    for (let j = 0; j<events[i]._embedded.venues.length; j++) {
		        if((typeof (events[i]._embedded.venues[j].location) != "undefined")){
			        venue_locations.push(events[i]._embedded.venues[j].location);
				}
		    }
		}
    }
    venue_locations = new Set(venue_locations);
     
    for(let pos of venue_locations.values()) {
    	markers.push(new google.maps.Marker({
                        position: new google.maps.LatLng(parseFloat(pos.latitude),
							 parseFloat(pos.longitude)),
                        map: map
                    }));
   	 }

    $("#map_view").show();
    $('#map_view').removeClass("animated flipInX").addClass("animated flipInX");
    google.maps.event.trigger(map, 'resize');
    map.setCenter(TORONTO);
}

function clear_view () {
    //Clear detailed view
    $( "#eventDetails" ).addClass( "hidden" );

    //Clear listing_view
    $("#events_list").empty();

    //Clear map view
    for (marker of markers)
        marker.setMap(null);
    markers = [];
    $("#map_view").hide();

    //Clear search filters
    $(".filter_input_fields").css("visibility", "hidden");
    $("#admin_msg_box").css("visibility", "hidden");

     $("#admin_msg_box").removeClass("animated flipInX");
     $(".filter_input_fields").removeClass("animated flipInX");
}

function change_view(view_type, data) {
    clear_view();

    if (view_type == "detailed_view")
        detailed_view(data);
    else if (view_type == "listing_view") {
        current_view_type = "listing_view";
        $(".filter_input_fields").css("visibility", "visible");
        $("#admin_msg_box").css("visibility", "visible");

         $("#admin_msg_box").addClass("animated flipInX");
         $(".filter_input_fields").addClass("animated flipInX");
        listing_view(data);
    }
    else if (view_type == "map_view") {
        current_view_type = "map_view";
        $(".filter_input_fields").css("visibility", "visible");
        $("#admin_msg_box").css("visibility", "visible");

         $("#admin_msg_box").addClass("animated flipInX");
         $(".filter_input_fields").addClass("animated flipInX");
        map_view(data);
    }
   
}

function filter_action (e) {
        let classification = $("#classification_filter").val();
        let city = $("#city_filter").val();
        let country = $("#country_filter").val();

        $.ajax({type:'GET',
            url: `${URL}&classificationName=${classification}&city=${city}&countryCode=${country}`,
            success: (res) => {
                if (Object.prototype.hasOwnProperty.call(res, '_embedded')) {
                    change_view(current_view_type, res._embedded.events);
                }
                else {
                    change_view(current_view_type, []);
                }
            }
        });
    }

function register_all_callbacks(e) {

    $("#back-button").click(function() {
        change_view("listing_view", current_events);
        $("#eventDetails").addClass("hidden");
    });


    $("#filter_button").click(filter_action);

    $("#top-event-list-button").click(
        () => {change_view("listing_view", current_events);});
    $("#top-event-map-button").click(
        () => {change_view("map_view", current_events)});

    $("#button2").click(function() {
	$(".filter_input_fields").removeClass("hidden");
    
    $(".filter_input_fields").addClass("animated flipInX");

    $("#admin_msg_box").removeClass("hidden");
    $("#admin_msg_box").addClass("animated flipInX");
    
        $("#main").slideUp(function () {
            $("#buttonclick").removeClass("hidden");
            change_view("listing_view", current_events);
            
        });
    });

     $("#button3").click(function() {
    $("#register-login").removeClass("hidden");
        $("#main").slideUp(function () {
            $("#buttonclick").addClass("hidden");
            
            
        });
    });
}

$(document).ready(register_all_callbacks);

        
        
    
