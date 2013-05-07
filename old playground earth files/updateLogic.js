var markerTimer = 0;
//This will be the main update loop, called EVERY FRAME!!!
function gameUpdate() {
    //draw the player in front of the camera.
    drawPlayer();
    //alert("drawing other players");
    //alert("players drawn, about to draw beacons");

    //alert("finished, about to recur");
    if (markerTimer >= MARKER_REFRESH_RATE) {
        clearMarkers();
        drawMarkers();
        markerTimer = 0;
    } else {
        markerTimer++;
    }
    
}

function drawMarkers() {
    var i = 0;
    for (i; i < playerList.length; i++) {
        var curPlayer = playerList[i];
        if (myGUID != curPlayer.ID) {
            //other Players.
            var curPlayerMarker = new google.maps.Marker({
                position: new google.maps.LatLng(curPlayer.pos.pos0, curPlayer.pos.pos1),
                map: map,
                title: curPlayer.name
            });
            markers.push(curPlayerMarker);
        }
    }
}
var myModel;
var myPlayerListLoc = -1;
function drawPlayer() {
    var pos = me.characterLla;    
    //alert("drawing player" + pos);
    switch (TRAVEL_MODE) {
        case MODE_WALKING:
            myModel = MAN_MODEL_LOCATION;
            break;
        case MODE_DRIVING:
            myModel = CAR_MODEL_LOCATION;
            break;
        case MODE_FLYING:
            myModel = PLANE_MODEL_LOCATION;
            break;
        default:
            myModel = MAN_MODEL_LOCATION;
            break;
    }
    if (myPlayerListLoc == -1) {
        addModelAtLocation(pos, myModel, 'localPlayerModel', me.headingAngle);
        myPlayerListLoc = findChildByName('localPlayerModel');
    } else {
   updateModelPosition(pos, myModel, 'localPlayerModel', me.headingAngle, myPlayerListLoc);
    }
}

var markers = [];
function clearMarkers() {
    if (markers) {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
    }
}

var lastModel;
//var playerArray = new Array();
function drawOtherPlayers() {
    var i = 0;
    for (i; i < playerList.length; i++) {
    //for(i; i<1 ;i++) {
        var curPlayer = playerList[i];
        if (myGUID != curPlayer.ID && curPlayer.drawFlag) {
            var posArray = {};
            posArray[0] = curPlayer.pos.pos0;
            posArray[1] = curPlayer.pos.pos1;
            posArray[2] = curPlayer.pos.pos2;
            if (curPlayer.modelLocation == null) {
                curPlayer.modelLocation = MAN_MODEL_LOCATION;
            }
            addModelAtLocation(posArray, curPlayer.modelLocation, curPlayer.ID, curPlayer.heading);
            //TODO: Check to draw certain kinds of markers...
        }
        if (!curPlayer.drawFlag) {
            removeModel(curPlayer.ID);
        }
    }
}
var lastRacesList;
function drawBeacons() {
    var i = 0;
    for (i; i < racesList.length; i++) {
        //alert("DRAWBEACONS ALERT");
        curRace = racesList[i];
        if (curRace.winningPlayer != "00000000-0000-0000-0000-000000000000") {
            //somebody won the race
            //TODO change from alert
            alert("race " + curRace.Name + " was won by " + curRace.winningPlayer);
            if (myGuid == curRace.winningPlayer) {
                alert("infact you!!! are that winning player!");
            }
        }
        else {
            var curPos = [curRace.nextWayPoint.pos0, curRace.nextWayPoint.pos1, curRace.nextWayPoint.pos2];
            //alert(curRace.pos);
            addModelAtLocation(curPos, BEACON_LOCATION, curRace.ID + "b2", 0);

            var beaconMarker = new google.maps.Marker({
                position: new google.maps.LatLng(curPos[0], curPos[1]),
                map: map,
                title: "Race Waypoint"
            });
            markers.push(beaconMarker);
            //todo is this right?
            curPos = [curRace.secondWayPoint.pos0, curRace.secondWayPoint.pos1, curRace.secondWayPoint.pos2];
            if (curPos != [-1.0, -1.0, -1.0]) {
                addModelAtLocation(curPos, BEACON_LOCATION, curRace.ID, 0);
            }
        }
    }
}


function getScreenCoords(location) {
    var retVal = [0, 0];
    var locationProj = ge.getView().project(location[0], location[1], location[2], ge.ALTITUDE_RELATIVE_TO_GROUND);
    if (locationProj == null) {
        return null;
    }
    else {
        retVal[0] = Math.round(locationProj.getX());
        retVal[1] = Math.round(locationProj.getY());
        return retVal;
    }
}


//returns TRUE if the locatino (cartesian location) collides with a BUILDING within collisionDistance eps.
function checkCollision(location, collisionDistance) {
    //first have to project...
    var locationProj = getScreenCoords(location);
    if (!locationProj)
        return true;

    var hitTestResult = ge.getView().hitTest(locationProj[0], ge.UNITS_PIXELS, locationProj[1], ge.UNITS_PIXELS, ge.HIT_TEST_BUILDINGS);
    //var hitTestResult = ge.getView().hitTest(0.5, ge.UNITS_FRACTION, 0.75, ge.UNITS_FRACTION, ge.HIT_TEST_BUILDINGS); //0.75 is a guestemate. Not worth calculating
    if (hitTestResult) {
        var charGLat = new GLatLng(me.characterLla[0], me.characterLla[1]);
        var distFromResult = charGLat.distanceFrom(new GLatLng(hitTestResult.getLatitude(), hitTestResult.getLongitude()));
        if (distFromResult < DISTANCE_FROM_COLLISION) {
            currentSpeed = 0;
            return true;
        }
    }
    return false;
}
