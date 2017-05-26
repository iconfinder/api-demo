<?php
	// Get the client id and secret by registering your application on https://www.iconfinder.com/account/applications
	$CLIENT_ID = "<< INSERT CLIENT ID HERE >>";
	$CLIENT_SECRET = "<< INSERT CLIENT SECRET HERE >>";
	
	// Request token
	$AUTH_URL = "https://www.iconfinder.com/api/v3/oauth2/token";
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $AUTH_URL);
	curl_setopt($ch, CURLOPT_POST, 1);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_POSTFIELDS, "grant_type=jwt_bearer&client_id=$CLIENT_ID&client_secret=$CLIENT_SECRET");
	$result = curl_exec($ch);
	curl_close($ch); 
		
	// Prepare response
 	header('Content-type: application/json');
	
	// return JWT to requesting app
	if($result == FALSE) {
		// Something went wrong.
		echo json_encode(array("error" => "CURL request failed."));
	}
	else {
	    $result_decoded = json_decode($result);
		
		if(array_key_exists("error", $result_decoded) or !array_key_exists("access_token", $result_decoded)) {
			// Use this for additional error handling.
			echo $result;
		}
		else {
			// Print successful response.
			echo $result;
		}
	}
?>
