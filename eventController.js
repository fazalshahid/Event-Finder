TICKETMASTER_BASE_URL = "https://app.ticketmaster.com/discovery/v2/events.json?size=10&apikey=";
TICKETMASTER_API_KEY = "27mLqO6JmMfWlES8MKnMVG1tkm75I9cE";
TICKETMASTER_URL = TICKETMASTER_BASE_URL + TICKETMASTER_API_KEY;

const request = require('request');


var session = require('./sessionController.js');

function get_events_list(req, res) {
    console.log(">> get_events_list");
    console.log(req.query);

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
                        res.status(200).json(data);
                    },
                    function (err) { //Don't do anything, just return
                        res.status(200).json(data);
                    }
                );
            }
        }
    );
}


exports.get_events_list = get_events_list;