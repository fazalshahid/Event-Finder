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
let admin = "false";
let default_cookie_expiration = 2*24*60*60 //2 days




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

    //Clear login and register views
    $("#login-form").addClass("hidden");
    $("#register-form").addClass("hidden");
}

function login_view() {
    $("#login-form").removeClass("hidden");
}

function register_view() {
    $("#register-form").removeClass("hidden");
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
    else if (view_type == "login_view") {
        current_view_type = "login_view";
        login_view();
    }
    else if (view_type == "register_view") {
        current_view_type = "register_view";
        register_view();
    }
}

function filter_action (e) {
        let classification = $("#classification_filter").val();
        let city = $("#city_filter").val();
        let country = $("#country_filter").val();

        $.ajax({type:'GET',
            url: `${EVENTS_URL}?classificationName=${classification}&city=${city}&countryCode=${country}`,
            headers: auth_headers(),
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


function write_cookie(name, value, expiration) {
    var date = new Date();
    if (!expiration)
        expiration = default_cookie_expiration;
    date.setTime(date.getTime() + expiration);
    var expires = "expires=" + date.toUTCString();

    document.cookie = name + "=" + value + ";" +  expires + "; path=/";
}

function read_cookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function set_session(response) {
    write_cookie('status', 'logged_in');
    write_cookie('accessToken', response.token);
    write_cookie('username', response.user_name);
}

function clear_session(response) {
    write_cookie('status', "");
    write_cookie('accessToken', "");
    write_cookie('username', "");
}

function is_logged_in() { 
    return (read_cookie('status') != "");
} 
 
function auth_headers() {
    if (is_logged_in())
        return {Authorization: "JWT " + read_cookie('accessToken')}
    else return {}
}

function logged_in_username() { 
    return read_cookie('username');
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
                set_session(res);
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

            set_session(res);
            fetch_admin_messages();
            home_page();
        }
    });
}

function sign_out(){
        clear_session();
        $("#top-login-button").removeClass("hidden");
        $("#top-logout-button").addClass("hidden");
        $("#admin_only").addClass("hidden");
        change_view("login_view");
        set_login_logout_button();
}

function set_login_logout_button() {
    if(is_logged_in()) {
        $("#top-login-button").addClass("hidden");
        $("#top-logout-button").removeClass("hidden");
        $("#user_name").empty();
        $("#user_name").append('<label>'+'Logged in as ' + logged_in_username() + '</label>');
    }
    else{
        $("#top-login-button").removeClass("hidden");
        $("#top-logout-button").addClass("hidden");
        $("#user_name").empty();
    }
}


function fetch_admin_messages(){
    console.log("Making ajax call to get admin messages");
    $.ajax({
        type: 'GET',

        headers:auth_headers(),
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
                    $("#admin_messages").append(
                        `   <button data="${data[i]._id}" type="button" class="delete_button btn btn-info button-padding">
                                <span class="graphic"></span>Delete
                            </button> `);
                }
    } //end of for loop
}

function get_my_events(){
    $.ajax({
        type: 'get',
        headers: auth_headers(),
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
    $.ajax({
        type: 'POST',

        //contentType: "application/json",
        data: {
            id:id,
            note:""
        },
        headers: auth_headers(),
        url: MY_EVENT_URL,
        success: function(res){
            console.log(res);
            //get_my_events();
        }
    });
}

function edit_my_event(){
    var id="1234";
    $.ajax({
        type: 'PUT',
        //contentType: "application/json",
        headers:auth_headers(),
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
    $.ajax({
        type: 'DELETE',
        //contentType: "application/json",
        headers:auth_headers(),
        url: MY_EVENT_URL + id,
        success: function(res){
            console.log(res);
            get_my_events();
        }
    });
}


function home_page() {
    $(".filter_input_fields").removeClass("hidden");
    $("#main").slideUp(function () {
        $("#buttonclick").removeClass("hidden");
        change_view("listing_view", current_events);
        set_login_logout_button();
    });
}

function admin_post(){
    var msg = $("#admin_textbox").val(); //extract msg from box
    $("#admin_textbox").val(""); //clear the text box

    //alert("Message is "+msg);

    $.ajax({
        type: 'POST',

        //contentType: "application/json",
        data: {
            msg:msg
        },

        headers:auth_headers(),
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
        change_view("login_view");

    });
    $("#top-logout-button").click(
        () => { sign_out(); });


    $("#button2").click(function() {
    	$(".filter_input_fields").removeClass("hidden");
        $(".filter_input_fields").addClass("animated flipInX");     
        $("#admin_msg_box").removeClass("hidden");      
        $("#admin_msg_box").addClass("animated flipInX");

        $("#main").slideUp(function () {
            $("#buttonclick").removeClass("hidden");
            change_view("listing_view", current_events);
            set_login_logout_button();
        });
    });

     $("#button3").click(function() {
        $(".filter_input_fields").removeClass("hidden");
        $(".filter_input_fields").addClass("animated flipInX");     
        $("#admin_msg_box").removeClass("hidden");      
        $("#admin_msg_box").addClass("animated flipInX");

        $("#main").slideUp(function () {
            $("#buttonclick").removeClass("hidden"); 
            change_view("login_view");
            set_login_logout_button();
        });
    });

    $("#sign_up").click(sign_up);
    $("#sign_in").click(sign_in);



     $("#post_button").click(admin_post);

     setInterval(fetch_admin_messages, 5000);
}

$(document).ready(register_all_callbacks);

        
        
    
