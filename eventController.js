TICKETMASTER_BASE_URL = "https://app.ticketmaster.com/discovery/v2/events.json?size=5&apikey=";
TICKETMASTER_API_KEY = "27mLqO6JmMfWlES8MKnMVG1tkm75I9cE";
TICKETMASTER_URL = TICKETMASTER_BASE_URL + TICKETMASTER_API_KEY;

const request = require('request');
var Event = require('./models/EventModel').model;


var session = require('./sessionController.js');

function get_events_list(req, res) {
    var query = req.query;
    var classification = req.query.classificationName;
    var city = req.query.city;
    var country = req.query.countryCode;

    request.get(`${TICKETMASTER_URL}&classificationName=${classification}&city=${city}&countryCode=${country}`,
        function (err, res_in, data) {
            if (err) { res.status(200).send(Error("Unknown problem with TicketMaster API"))}
            else {
                session.is_logged_in(req, res).then(
                    function (user) {
                        Event.find({email:user.email},
                            function(err,events) {
                                if(err){
                                    res.status(200).json(JSON.parse(data)); //lol
                                }
                                else {
                                    console.log(">>>Getting to logged in user part")
                                    data = JSON.parse(data);
                                    for (let i = 0; i < data._embedded.events.length; i++) {
                                        if (typeof(events.find(
                                            //function (event) {return event.event_id == data._embedded.events[i].id}))
                                                function (event) { if (event.event_id == data._embedded.events[i].id){
                                                    data._embedded.events[i].note = event.note
                                                    return event.event_id == data._embedded.events[i].id}
                                                else return false}))
                                            != "undefined") {
                                            data._embedded.events[i].in_my_events = true;
                                           // data._embedded.events[i].note = event.note;
                                            console.log("happens");
                                        }
                                        else {
                                            data._embedded.events[i].in_my_events = false;
                                        }
                                    }
                                    res.status(200).json(data);
                                }
                        });
                    },
                    function (err) { //Don't do anything, just return
                        console.log("promise is failing");
                        res.status(200).json(JSON.parse(data));
                    }
                );
            }
        }
    );
}


exports.get_events_list = get_events_list;