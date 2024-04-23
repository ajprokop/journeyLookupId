const axios = require("axios");
const functions = require('@google-cloud/functions-framework');

const JOURNEY_LOOKUP_URL = "https://app.journeyid.io/api/system/sessions/lookup";

/*
 * HTTP function that supports CORS requests.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
functions.http('journeyIdLookup', (req, res) => { 
    res.set('Access-Control-Allow-Origin', '*');

    if (req.method === 'OPTIONS') {
      // Send response to OPTIONS requests
      res.set('Access-Control-Allow-Methods', 'POST');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      res.set('Access-Control-Max-Age', '3600');
      res.status(204).send('');
    } else {
		const referenceId = req.body.sessionInfo.parameters["journeyReferenceId"];
		const journeyToken = req.body.sessionInfo.parameters["journeyToken"];
        JourneyIdLookup(res, journeyToken, referenceId);
    }
});   

async function JourneyIdLookup(res, journeyToken, referenceId) {
    res.set('Content-Type', 'application/json');

	TxtResponse = "";
	jsonResponse = {
		"fulfillment_response": {
			"messages": [{
				"text": {
					"text": [TxtResponse]
				}
			}]
		},
		"session_info": {
			"parameters": {
				"Authenticated": false,
				"journeyFirstName": null,
				"journeyLastName": null
			}
		}
	};
	let JourneyLookupURL = `${JOURNEY_LOOKUP_URL}?external_ref=${referenceId}`;
	let config = {
		method: 'get',
		url: JourneyLookupURL,
		headers: {
			'Authorization': `Bearer ${journeyToken}`,
			'accept': 'application/json',
			'User-Agent': 'Axios 1.1.3'
		}
	};

	try {
		const JourneyLookupResponse = await axios(config);
		console.dir(JourneyLookupResponse.data);
		jsonResponse.session_info.parameters.Authenticated = JourneyLookupResponse.data.isAuthenticated;
		jsonResponse.session_info.parameters.journeyFirstName = JourneyLookupResponse.data.user.firstName;
		jsonResponse.session_info.parameters.journeyLastName = JourneyLookupResponse.data.user.lastName;
		res.status(200).send(JSON.stringify(jsonResponse));
	} catch (e) {
		console.log("Journey Id Lookup Failed! Exception");
		console.log(`Exception : ${e}`);
		res.status(200).send(JSON.stringify(jsonResponse));
	}
}