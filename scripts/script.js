TICKETMASTER_BASE_URL = "https://app.ticketmaster.com/discovery/v2/events.json?size=190&apikey=";
TICKETMASTER_API_KEY = "27mLqO6JmMfWlES8MKnMVG1tkm75I9cE";
TICKETMASTER_URL = TICKETMASTER_BASE_URL + TICKETMASTER_API_KEY;
//https://app.ticketmaster.com/discovery/v2/events.json?apikey=27mLqO6JmMfWlES8MKnMVG1tkm75I9cE

OUR_SERVER_BASE_URL = "http://localhost:3000";
MY_EVENTS_URL = OUR_SERVER_BASE_URL + "/my_events";
MY_EVENT_URL = OUR_SERVER_BASE_URL + "/my_event/";

SIGNUP_URL = OUR_SERVER_BASE_URL + "/sign_up";
SIGNIN_URL = OUR_SERVER_BASE_URL + "/sign_in";

EVENTS_URL = OUR_SERVER_BASE_URL + "/events";

ADMIN_GET_URL = OUR_SERVER_BASE_URL + "/api/messages";
ADMIN_POST_URL = OUR_SERVER_BASE_URL + "/api/messages";

//Global? variables
let map;
let detailed_map;
const TORONTO = {lat: 43.641409, lng: -79.389367};
let markers = [];
let detailed_markers=[];
let current_view_type = "listing_view";
let current_events = [];
let scroll=0;
let login_status = "logged_out";
let admin = "false";

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
                    <p>${events[i].name}        <Button id="my${events[i].id}"> Add to My Events</Button><br>
                       ${events[i].dates.start.localDate} @${events[i].dates.start.localTime}<p/>
                 </a>`);

	        $("#"+events[i].id).click(() => {
                scroll = $(window).scrollTop();
	            clear_view();
	            change_view("detailed_view", events[i].id);
				
				current_row = events[i].id;
	        });

            $("#my"+events[i].id).click(() => {
                console.log("small clicked");
            add_to_my_events(events[i].id);

        });
            $("#my"+events[i].id).mouseenter(() => {
                $("#"+events[i].id).unbind("click");
                console.log("mouse enter")
        });
            $("#my"+events[i].id).mouseleave(() => {
                $("#"+events[i].id).bind("click",() => {
                scroll = $(window).scrollTop();
            clear_view();
            change_view("detailed_view", events[i].id);

            current_row = events[i].id;
        });
            console.log("mouse leave");
        });

        }

	if(scroll!=0){
			$(window).scrollTop(scroll);
		    scroll=0;
		}    
}

function my_events_view(events) {
    //current_events = events;
    for(let i=0; i<events.length; i++) {
        $("#events_list").append(
            `<a  class="list-group-item animated flipInX" id="${events[i].event_id}">
                    <p>${events[i].name}              Note: "${events[i].note}" <Button id="rm${events[i].event_id}"> Remove from My Events</Button><br>
                       ${events[i].date} @${events[i].time}<p/>
                 </a>`);

        $("#"+events[i].event_id).click(() => {
            scroll = $(window).scrollTop();
        clear_view();
        change_view("detailed_view", events[i].event_id);

        current_row = events[i].event_id;
    });

        $("#rm"+events[i].event_id).click(() => {

        delete_my_event(events[i].event_id);

    });
        $("#rm"+events[i].event_id).mouseenter(() => {
            $("#"+events[i].event_id).unbind("click");

    });
        $("#rm"+events[i].event_id).mouseleave(() => {
            $("#"+events[i].event_id).bind("click",() => {
            scroll = $(window).scrollTop();
        clear_view();
        change_view("detailed_view", events[i].event_id);

        current_row = events[i].event_id;
    });

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
    $("#admin_msg_box").css("visibility", "hidden");       
    $(".filter_input_fields").css("visibility", "hidden");     
    $("#admin_msg_box").removeClass("animated flipInX");       
    $(".filter_input_fields").removeClass("animated flipInX");
}

function change_view(view_type, data) {
    clear_view();

    if (view_type == "detailed_view") {
        current_view_type = "detailed_view";
        detailed_view(data);
    }
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
    else if (view_type == "my_events_view") {
        current_view_type = "my_events_view";
        //$(".filter_input_fields").css("visibility", "visible");
        my_events_view(data);
    }
}

function filter_action (e) {
        let classification = $("#classification_filter").val();
        let city = $("#city_filter").val();
        let country = $("#country_filter").val();

        var accessToken = sessionStorage.getItem('accessToken');
        var authHeaders = {};
        if (accessToken!='null') {
            authHeaders.Authorization = "JWT "+accessToken;
        }

        $.ajax({type:'GET',
            url: `${EVENTS_URL}?classificationName=${classification}&city=${city}&countryCode=${country}`,
            headers: authHeaders,
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

function sign_up() {
    console.log(" Sign up clicked");

    $.ajax({
        type: 'POST',
        //contentType: "application/json",
        data: {
            email:$('#email_sign_up').val(),
            password:$('#pwd_sign_up').val()
        },
        //url: 'https://boiling-beach-43004.herokuapp.com/sign_up',
        url: SIGNUP_URL,
        success: function(res){
            if(res=="error"){
               console.log( "Username is already taken");
            }
            else {

                sessionStorage.setItem('accessToken', res.token);
                sessionStorage.setItem('user_name', res.user_name);
                sessionStorage.setItem('login_status', 'logged_in');
                login_status = "logged_in";
                home_page();
            }
        },
        statusCode: {
            400: function (response) {
                console.log("Username is already taken");
            }
        }
    });

}

function sign_in() {
    console.log(" Sign in clicked");
    var email = $('#email_sign_in').val();
    $.ajax({
        type: 'POST',
        //contentType: "application/json",
        data: {
            email:$('#email_sign_in').val(),
            password:$('#pwd_sign_in').val()
        },
        url: SIGNIN_URL,
        success: function(res){

            if(email=="admin@admin.com"){
                 //$("#register-login").addClass("hidden");
                $("#admin_only").removeClass("hidden");

                admin = "true";
            }

            //Upon successful login display the admin messages in the admin box
            //fetch the admin messages below:

            fetch_admin_messages();

            console.log(res.token);
            sessionStorage.setItem('accessToken', res.token);
            sessionStorage.setItem('user_name', res.user_name);
            sessionStorage.setItem('login_status', 'logged_in');
            home_page();
        }
    });
}

function sign_out(){

        sessionStorage.setItem('accessToken', null);
        sessionStorage.setItem('login_status', 'logged_out');
        $("#top-login-button").removeClass("hidden");
        $("#top-logout-button").addClass("hidden");
        $("#admin_only").addClass("hidden");
        home_page();

}

function set_login_logout_button(){

    if(sessionStorage.getItem("login_status")=="logged_in") {
        $("#top-login-button").addClass("hidden");
        $("#top-logout-button").removeClass("hidden");
        $("#user_name").append('<label>'+'Logged in as '+sessionStorage.getItem("user_name")+'</label>');
    }
    else{
        $("#top-login-button").removeClass("hidden");
        $("#top-logout-button").addClass("hidden");
        $("#user_name").empty();
    }

}

function show_login_button(){
    $("#top-login-button").removeClass("hidden");
    $("#top-logout-button").addClass("hidden");
}

function show_logout_button(){
    $("#top-login-button").addClass("hidden");
    $("#top-logout-button").removeClass("hidden");
    $("#user_name").append('<label>'+'Logged in as '+sessionStorage.getItem("user_name")+'</label>');

}

function login_page(){
    clear_view();
    $("#register-login").removeClass("hidden");
    hide_top_buttons();

}


function fetch_admin_messages(){


    var authHeaders = {};
    var accessToken = sessionStorage.getItem('accessToken');
    if (accessToken!='null') {
        authHeaders.Authorization = "JWT "+accessToken;
    }
    else{
        return "Not authorized to get admin messages yet";
    }

    console.log("Making ajax call to get admin messages");
    $.ajax({
        type: 'GET',

        headers:authHeaders,
        url: ADMIN_GET_URL,

        success: function(data){
            console.log(data);
            //get_my_events();
            if(data=="Unauthorized"){
                console.log("Login required")
            }
            else {
                console.log("admin msgs received : " + data);
                appendAdminMessages(data);
                //console.log("admin msgs received : " + data[0].text);
                //change_view("my_events_view", data);
            }
        }
    });
}

function appendAdminMessages(data){

                    $("#admin_messages").empty();

                    for(var i=data.length-1; i>=0; i--) {


                          $("#admin_messages").append(`
                          <li class="msg_text">${data[i].text}</li>`);


                if(admin == "true"){
                         $("#admin_messages").append(`  <button data="${data[i]._id}" type="button" class="delete_button btn btn-info button-padding">
                              <span class="graphic"></span>Delete
                            </button> `);

                }



                    } //end of for loop
}

function sign_out(){

        admin = "false";
        sessionStorage.setItem('accessToken', null);
        sessionStorage.setItem('login_status', 'logged_out');
        $("#top-login-button").removeClass("hidden");
        $("#top-logout-button").addClass("hidden");
        $("#admin_only").addClass("hidden");
        home_page();

}

function get_my_events(){
    var accessToken = sessionStorage.getItem('accessToken');
    console.log(accessToken);
    var authHeaders = {};
    if (accessToken!='null') {
        authHeaders.Authorization = "JWT "+accessToken;
    }

    $.ajax({
        type: 'get',
        headers: authHeaders,
        url: MY_EVENTS_URL,
        success: function(data){
            if(data=="Unauthorized"){
                console.log("Login required")
            }
            else {
                console.log(data);
                change_view("my_events_view", data);
            }
        }
    });
}

function add_to_my_events(id){
    var authHeaders = {};
    var accessToken = sessionStorage.getItem('accessToken');
    if (accessToken!='null') {
        authHeaders.Authorization = "JWT "+accessToken;
    }
    $.ajax({
        type: 'POST',

        //contentType: "application/json",
        data: {
            id:id,
            note:""
        },
        headers:authHeaders,
        url: MY_EVENT_URL,
        success: function(res){
            console.log(res);
            //get_my_events();
        }
    });
}

function edit_my_event(){
    var id="1234";
    var authHeaders = {};
    var accessToken = sessionStorage.getItem('accessToken');
    if (accessToken!='null') {
        authHeaders.Authorization = "JWT "+accessToken;
    }
    $.ajax({
        type: 'PUT',
        //contentType: "application/json",
        headers:authHeaders,
        data: {
            note:"abcdef"
        },
        url: MY_EVENT_URL+id,
        success: function(res){
            console.log(res);
        }
    });
}

function delete_my_event(id){
    var accessToken = sessionStorage.getItem('accessToken');
    var authHeaders = {};
    if (accessToken!='null') {
        authHeaders.Authorization = "JWT "+accessToken;
    }

    $.ajax({
        type: 'DELETE',
        //contentType: "application/json",
        headers:authHeaders,
        url: MY_EVENT_URL + id,
        success: function(res){
            console.log(res);
            get_my_events();
        }
    });
}


function home_page() {
    $("#register-login").addClass("hidden");
    $(".filter_input_fields").removeClass("hidden");
    $("#main").slideUp(function () {
        $("#buttonclick").removeClass("hidden");
        change_view("listing_view", current_events);
        set_login_logout_button();
    });
}

function hide_top_buttons(){
    $("#top-login-button").addClass("hidden");
    $("#top-logout-button").addClass("hidden");
   // $("#top-event-list-button").addClass("hidden");
   // $("#top-event-map-button").addClass("hidden");
}

function show_top_buttons(){
    $("#top-login-button").addClass("hidden");
    $("#top-logout-button").addClass("hidden");
   // $("#top-event-list-button").addClass("hidden");
    //$("#top-event-map-button").addClass("hidden");
}


function admin_post(){
    var msg = $("#admin_textbox").val(); //extract msg from box
    $("#admin_textbox").val(""); //clear the text box

    //alert("Message is "+msg);

    var authHeaders = {};
    var accessToken = sessionStorage.getItem('accessToken');
    if (accessToken!='null') {
        authHeaders.Authorization = "JWT "+accessToken;
    }
    $.ajax({
        type: 'POST',

        //contentType: "application/json",
        data: {
            msg:msg
        },

        headers:authHeaders,
        url: ADMIN_POST_URL,

        success: function(res){
            console.log(res);
            //get_my_events();
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
    $("#top-my_event-list-button").click(
        () => {get_my_events()});
    $("#top-login-button").click(
        () => {
        login_page();

    });
    $("#top-logout-button").click(
        () => {sign_out();});


    $("#button2").click(function() {
	$(".filter_input_fields").removeClass("hidden");

    $(".filter_input_fields").addClass("animated flipInX");     
            
        $("#admin_msg_box").removeClass("hidden");      
        $("#admin_msg_box").addClass("animated flipInX");
        $("#main").slideUp(function () {
            $("#buttonclick").removeClass("hidden");
            change_view("listing_view", current_events);
            show_login_button();

            
        });
    });

     $("#button3").click(function() {
    $("#register-login").removeClass("hidden");
        $("#main").slideUp(function () {
            $("#buttonclick").addClass("hidden");

            
            
        });
    });

    $("#sign_up").click(sign_up);
    $("#sign_in").click(sign_in);



     $("#post_button").click(admin_post);

     setInterval(fetch_admin_messages, 5000);
}

$(document).ready(register_all_callbacks);

        
        
    
