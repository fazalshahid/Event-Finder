TICKETMASTER_BASE_URL = "https://app.ticketmaster.com/discovery/v2/events.json?size=190&apikey=";
TICKETMASTER_API_KEY = "27mLqO6JmMfWlES8MKnMVG1tkm75I9cE";
TICKETMASTER_URL = TICKETMASTER_BASE_URL + TICKETMASTER_API_KEY;
//https://app.ticketmaster.com/discovery/v2/events.json?apikey=27mLqO6JmMfWlES8MKnMVG1tkm75I9cE

OUR_SERVER_BASE_URL = "http://localhost:3000";
//OUR_SERVER_BASE_URL = "https://titaniumstrong.herokuapp.com"
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
let default_cookie_expiration = 500000000000000000000000000000000 //2 days




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
<div class = "container">
    <div class = "row">
    <div class="col-md-4 col-sm-2">
                    <p>${events[i].name}</p>
          </div>
    
        <div id="my-event-div${events[i].id}" class="col-md-7 col-sm-3">
            <div class="form-group">
                <div class="input-group">
                    <span class="input-group-addon">Note</span>
                    <input id="mynote${events[i].id}" type="text" class="form-control">
                    <div class="input-group-btn">
                        <button id = "my${events[i].id}" type="button" class="btn btn-warning" data-toggle="tooltip" title="Add to my event">
                            +
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

                    <p>   ${events[i].dates.start.localDate} @${events[i].dates.start.localTime}<p/>
                 </a>`);

	        $("#"+events[i].id).click(() => {
                scroll = $(window).scrollTop();
	            clear_view();
	            change_view("detailed_view", events[i].id);
				
				current_row = events[i].id;
	        });

            $("#my"+events[i].id).click(() => {
                console.log("small clicked");
            add_to_my_events(events[i].id,$("#mynote"+events[i].id).val());

        });
            $("#my-event-div"+events[i].id).mouseenter(() => {
                $("#"+events[i].id).unbind("click");
                console.log("mouse enter");
        });
            $("#my-event-div"+events[i].id).mouseleave(() => {
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

<div class = "container">
    <div class = "row">
    <div class="col-md-4 col-sm-2">
                    <p>${events[i].name}</p>
          </div>
    
        <div id="my-event-div${events[i].event_id}" class="col-md-7 col-sm-3">
            <div class="form-group">
                <div class="input-group">
                    <span class="input-group-addon">Note</span>
                    <input id="mynote${events[i].event_id}" type="text" class="form-control" value="${events[i].note}" readonly>
                    <div class="input-group-btn">
                        <button id = "ed${events[i].event_id}" type="button" class="btn btn-warning" data-toggle="tooltip">
                            Edit Note
                        </button>
                        <button id = "rm${events[i].event_id}" type="button" class="btn btn-danger" data-toggle="tooltip" title= "Remove From my Events">
                            X
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

                    <p>${events[i].date} @${events[i].time}</p>
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

        $("#ed"+events[i].event_id).click(() => {
            //console.log($(this).attr("value"));
            //console.log($("#ed"+events[i].event_id).text());
            if (($("#ed"+events[i].event_id).text()) != "Submit"){
                $("#ed"+events[i].event_id).text("Submit");
                $("#mynote"+events[i].event_id).removeAttr("readonly");
            }
            else{
                console.log("I'm here");
                edit_my_event(events[i].event_id, events[i].note);
            }
            

    });
        $("#my-event-div"+events[i].event_id).mouseenter(() => {
            $("#"+events[i].event_id).unbind("click");

    });
        $("#my-event-div"+events[i].event_id).mouseleave(() => {
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
        set_login_logout_button();
    }
    else if (view_type == "listing_view") {
        current_view_type = "listing_view";
        $(".filter_input_fields").css("visibility", "visible");
         $("#admin_msg_box").css("visibility", "visible");      
           
             $("#admin_msg_box").addClass("animated flipInX");      
             $(".filter_input_fields").addClass("animated flipInX");    
        listing_view(data);
        set_login_logout_button();
    }
    else if (view_type == "map_view") {
        current_view_type = "map_view";
        $(".filter_input_fields").css("visibility", "visible");
        $("#admin_msg_box").css("visibility", "visible");       
            
        $("#admin_msg_box").addClass("animated flipInX");      
        $(".filter_input_fields").addClass("animated flipInX");
        map_view(data);
        set_login_logout_button();
    }
    else if (view_type == "my_events_view") {
        current_view_type = "my_events_view";
        //$(".filter_input_fields").css("visibility", "visible");
        my_events_view(data);
        set_login_logout_button();
    }
    else if (view_type == "login_view") {
        current_view_type = "login_view";
        login_view();
        hide_both_login_logout_button();
    }
    else if (view_type == "register_view") {
        current_view_type = "register_view";
        register_view();
        hide_both_login_logout_button();
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
            console.log(res);
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
    console.log(">>>>In set_session");
    console.log(response);
    write_cookie('status', 'logged_in');
    write_cookie('accessToken', response.token);
    write_cookie('username', response.username);
    write_cookie('email', response.email);
}

function clear_session(response) {
    write_cookie('status', "");
    write_cookie('accessToken', "");
    write_cookie('username', "");
    write_cookie('email', "");
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

function logged_in_email() { 
    return read_cookie('email');
}


function sign_up() {

    $.ajax({
        type: 'POST',
        data: {
            username:$('#user_name_sign_in').val(),
            email:$('#email_sign_up').val(),
            password:$('#pwd_sign_up').val()
        },
        url: SIGNUP_URL,
        success: function(res){

                set_session(res);
                fetch_admin_messages();
                home_page();
                $("#register_error").addClass("hidden");

        },
        statusCode: {
            401: function (response) {
                $("#register_error").removeClass("hidden");
            }
        }
    });
}

function sign_in() {
    var email = $('#email_sign_in').val();
    $.ajax({
        type: 'POST',

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
            $("#login_error").addClass("hidden");
        },
        statusCode: {
            401: function (response) {
                $("#login_error").removeClass("hidden");
            }
        }
    });
}

function sign_out(){
        clear_session();
        $("#top-login-button").removeClass("hidden");
        $("#top-logout-button").addClass("hidden");
        $("#admin_only").addClass("hidden");
       // change_view("login_view");
        set_login_logout_button();
        location.reload();
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

function hide_both_login_logout_button(){
    $("#top-login-button").addClass("hidden");
    $("#top-logout-button").addClass("hidden");
    $("#user_name").empty();
}


function fetch_admin_messages(){
    if (is_logged_in()) {
        //console.log("Making ajax call to get admin messages");
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
                   // console.log("admin msgs received : " + data);
                    appendAdminMessages(data);
                    //console.log("admin msgs received : " + data[0].text);
                    //change_view("my_events_view", data);
                }
            }
        });
    }
}

function appendAdminMessages(data){
    $("#admin_messages").empty();

    var email= logged_in_email();
    console.log("returned email is "+ email);
    if(email == "admin@admin.com"){
        admin= "true";
        $("#admin_only").removeClass("hidden");
        //onsole.log("admin is logged in");
    }


    for(var i=data.length-1; i>=0; i--) {
        $("#admin_messages").append(`

            <div data="${data[i]._id}">
            <li class="msg_text list-group-item">> ${data[i].text} </li>`);
                if(admin == "true"){
                    $("#admin_messages").append(

                        `   <div data="${data[i]._id}">
                            <button data="${data[i]._id}" type="button" class="delete_button btn btn-info button-padding" style= "margin-top: 0px;"
>
                                <span class="graphic"></span>Delete
                            </button> 
                            </div>
                           `);
                }

                 $("#admin_messages").append(`
             `);
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

function add_to_my_events(id,note){
    $.ajax({
        type: 'POST',

        //contentType: "application/json",
        data: {
            id:id,
            note:note
        },
        headers: auth_headers(),
        url: MY_EVENT_URL,
        success: function(res){
            console.log(res);
                
            
        }
    });
}


//To do
function edit_my_event(id, note){
    //var id="1234";
    $.ajax({
        type: 'PUT',
        //contentType: "application/json",
        headers:auth_headers(),
        data: {
            note: note
        },
        url: MY_EVENT_URL+id,
        success: function(res){
            console.log(res);
            $("#ed"+id).text("Edit Note");
            $("#mynote"+id).attr("readonly");
            get_my_events();
            
        }
    });
}

function delete_my_event(id){
    $.ajax({
        type: 'DELETE',
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

function delete_admin_post(){

                var postID = $(this).attr('data');   //get the post ID first.
               
                //$('ul[data="${postID}"]').remove(); 
                
               
               


                console.log("postID captured is: " +postID);
                    //text= {'text': text};
                     $.ajax({
                          type:"DELETE",
                         // data: {'postID':postID},  //We send the server the postID and the comment itself
                          url:"/api/messages/" + postID ,
                          headers:auth_headers(),
                          async:true,
                          //dataType: "json",

                         success: function(res) {
                                 console.log(res);
                                 $('div[data='+postID+']').remove();


                             },
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
            hide_both_login_logout_button();
        });
    });

    $("#sign_in").click(sign_in);
    $("#go_to_signup").click(() => {change_view("register_view");})
    $("#sign_up").click(sign_up);
    



     $("#post_button").click(admin_post);

      $(document.body).on('click', '.delete_button', delete_admin_post); //need to handle these dynamically. Normal jquery click wont work
   

     setInterval(fetch_admin_messages, 5000);
}

$(document).ready(register_all_callbacks);

        
        
    
