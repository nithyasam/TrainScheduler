$(document).ready(function(){
//==============================================
// Initialize Firebase
//==============================================
var config = {
	apiKey: "AIzaSyB0Rtya1oDIlANhh-5cmyZrveAMy7IHCF0",
	authDomain: "trainscheduler-837be.firebaseapp.com",
	databaseURL: "https://trainscheduler-837be.firebaseio.com",
	projectId: "trainscheduler-837be",
	storageBucket: "trainscheduler-837be.appspot.com",
	messagingSenderId: "462082640121"
};
firebase.initializeApp(config);
$("#mainSection").hide();
$("#signUp").hide();
var dbRef = firebase.database().ref(); 
var trainId;
var intervalId;
//==============================================
// New User SignUp
//==============================================
function signUp(){
	var newemail = $("#newuseremail").val();
	var newpassword = $("#newpassword").val();
	console.log("newemail, newpassword: "+ newemail, newpassword);
	firebase.auth().createUserWithEmailAndPassword(newemail, newpassword).catch(function(error) {
		if (!error) {
			alert("Please login with the username and password created");
		} else {
			alert(error);
		}
		clearFields();
	});
}
//==============================================
// Existing User Login
//==============================================
function loginUser(){
	var email = $("#useremail").val();
	var password = $("#password").val();
	firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
		if (!error) {

		} else {
			alert(error);
		}
		clearFields();
	});
}
//==============================================
// Getting the currently signed-in user
//==============================================
firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
    // User is signed in.
    var email = user.email;
    $("#nameDisplay").html("Welcome "+email);
    $("#mainSection").show();
    $("#trainupdate").hide();
    $("#logInUser").hide();
    $("#signUp").hide();
    display();
    run();
} else {
	signOut();
}
});
//==============================================
// Handling user SignOut
//==============================================
function signOut(){
	firebase.auth().signOut().then(function() {
		console.log('Signed Out');
		$("#mainSection").hide();
		$("#logInUser").show();
		$("#signUp").hide();
	}, function(error) {
		console.error('Sign Out Error', error);
	});
	clearFields();
}
//==============================================
// Clearing Input Fields
//==============================================
function clearFields(){
	$(".form-control").val("");
}
//==============================================
// Calculates minutesAway based on firstTrainTime
// and frequency.
//==============================================
function minutesToArrival(firstTrainTime, frequency){
	var firstTimeConverted = moment(firstTrainTime, "hh:mm").subtract(1, "years");
	var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
	var minutesAway = frequency - (diffTime % frequency);
	return minutesAway;
}
//==============================================
// Retreving train info from firebase
//==============================================
function display(){
	dbRef.on("value", function(snap) {
		$("#tbody").empty();
		for(var train in snap.val()){
			var trainName = snap.val()[train].trainName;
			var destination = snap.val()[train].destination;
			var firstTrainTime = snap.val()[train].firstTrainTime;
			var frequency = snap.val()[train].frequency;
			var minutesAway = minutesToArrival(firstTrainTime, frequency);
			var nextArrival = moment().add(minutesAway, "minutes");
			$("#tbody").append("<tr><td>"+ trainName +"</td>"+
				"<td>"+ destination +"</td>"+
				"<td>"+ frequency +"</td>"+
				"<td>"+ moment(nextArrival).format("hh:mm a")+"</td>"+
				"<td>"+ minutesAway  +"</td>"+
				"<td><button class='btn btn-primary removeBtn' key="
				+train+">Remove</button></td>"+
				"<td><button class='btn btn-primary updateBtn' key="
				+train+">Update</button></td>"+
				"</tr>");
		}
	});
}
//==============================================
// Removing a train entry from firebase
//==============================================
function removeTrain(){
	id = $(this).attr("key");
	dbRef.child(id).remove(function(error) {
		if(error)
			console.log("Uh oh!");
		else 
			console.log("Success");
	});
}
//==============================================
// Handling train info updates
//==============================================
function updateTrain(){
	$("#trainadd").hide();
	$("#trainupdate").show();
	trainId = $(this).attr("key");
	dbRef.child(trainId).on("value", function(snapshot) {
		$("#updatetrainName").val(snapshot.val().trainName);
		$("#updatedestination").val(snapshot.val().destination);
		$("#updatefirstTrainTime").val(snapshot.val().firstTrainTime);
		$("#updatefrequency").val(snapshot.val().frequency);
	}, function (errorObject) {
		console.log("The read failed: " + errorObject.code);
	});
}
//==============================================
// Adding new train info
//==============================================
$("#addTrain").on("click", function(event){
	event.preventDefault();
	var trainName = $("#trainName").val().trim();
	var destination = $("#destination").val().trim();
	var firstTrainTime = $("#firstTrainTime").val().trim();
	var frequency = $("#frequency").val().trim();
	dbRef.push({
		"trainName" : trainName,
		"destination" : destination,
		"firstTrainTime" : firstTrainTime,
		"frequency" : frequency,
	});
	clearFields();
});
//==============================================
// Updates train info
//==============================================
$("#updateTrain").on("click", function(event){
	event.preventDefault();
	var upateTrainRef = dbRef.child(trainId);
	upateTrainRef.update({
		"trainName" : $("#updatetrainName").val().trim(),
		"destination" : $("#updatedestination").val().trim(),
		"firstTrainTime" : $("#updatefirstTrainTime").val().trim(),
		"frequency" : $("#updatefrequency").val().trim(),
	});
	$("#trainupdate").hide();
	$("#trainadd").show();
	clearFields();
});
//==============================================
// Login Button 
//==============================================
$("#login").on("click", function(event){
	event.preventDefault();
	loginUser();
});
//==============================================
// Logout Button
//==============================================
$("#logout").on("click", function(event){
	event.preventDefault();
	signOut();
	clearInterval(intervalId);
});
//==============================================
// New User Login
//==============================================
$("#signIn").on("click", function(){
	event.preventDefault();
	signUp();
});
//==============================================
// New user input
//==============================================
$("#newUser").on("click", function(){
	$("#signUp").show();
	$("#logInUser").hide();
});
//==============================================
// Updates minutes to arrival every minute
//==============================================
function run() {
	intervalId = setInterval(display, 60000);
}
$(document).on("click", ".removeBtn", removeTrain);
$(document).on("click", ".updateBtn", updateTrain);

});