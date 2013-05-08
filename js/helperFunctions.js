function createWayPointsJson(waypoints) {
    var retString = "[";
    for (var i = 0; i < waypoints.length; i++) {
        if (i > 0) {
            retString = retString + ","
        }

        retString = retString + createPositionJson(waypoints[i][0], waypoints[i][1], waypoints[i][2]);
    }
    retString = retString + "]";
    return retString;
}
function createPositionJson(pos0, pos1, pos2) {
    var retString = "{'pos0':" + pos0 + ",'pos1':" + pos1 + ",'pos2':" + pos2 + "}";
    return retString;
}

function createPositionObj(pos0Val, pos1Val, pos2Val) {
    var position = { pos0: pos0Val, pos1: pos1Val, pos2: pos2Val };
    return position;
}

function removeModel(modelName) {
    var geFeatures = ge.getFeatures();
    var childNodes = geFeatures.getChildNodes();
    var location = findChildByName(modelName);
    if (location > 0) {
        var placemark = ge.getFeatures().getChildNodes().item(location);
        var model = placemark.getGeometry();

        var loc = ge.createLocation('');
        loc.setLatLngAlt(0, 0, 0);
        model.setLocation(loc);
    }
    //childNodes.item(location).setPosition(new google.maps.LatLng(0, 0));
}

function findChildByName(name) {
    var i = 0;
    var ret = -1;
    var geFeatures = ge.getFeatures();
    if (geFeatures.hasChildNodes()) {
        var childNodes = geFeatures.getChildNodes();
        for (i; i < childNodes.getLength(); i++) {
            if (childNodes.item(i).getName() == name) {
                //ge.getFeatures().removeChild(ge.getFeatures().getChildNodes().item(i))
                return i;
            }
        }
    }
    return -1;
}

function addModelAtLocation(pos, modelLocation, id, heading) {
    // Create a 3D model, initialize it from a Collada file, and place it
    // in the world.
    var loc = findChildByName(id);
    var placemark;
    if (loc > -1) {
        //Check to see if already been added- if it has, just update it.
        //placemark = ge.getFeatures().getChildNodes().item(loc);
        updateModelPosition(pos, modelLocation, id,heading, loc);
        return;
    }
    else
        placemark = ge.createPlacemark('');

    placemark.setName(id);
    var model = ge.createModel('');
    ge.getFeatures().appendChild(placemark);
    var loc = ge.createLocation('');
    model.setLocation(loc);
    model.setAltitudeMode(ge.ALTITUDE_RELATIVE_TO_GROUND);
    var link = ge.createLink('');

    // A textured model created in Sketchup and exported as Collada.
    link.setHref(modelLocation);
    //link.setHref('http://earth-api-samples.googlecode.com/svn/trunk/examples/' +
    //          'static/splotchy_box.dae');
    //link.setHref('http://www.owlnet.rice.edu/~jc14/test/man_model.dae');
    model.setLink(link);

    var la = pos;
    loc.setLatitude(pos[0]);
    loc.setLongitude(pos[1]);
    loc.setAltitude(pos[2]);

    placemark.setGeometry(model);

    // add the model placemark to Earth

    ge.getFeatures().appendChild(placemark);
}

//This one's id is the index in the list
function updateModelPosition(pos, modelLocation, id, heading, loc) {
    var placemark = ge.getFeatures().getChildNodes().item(loc);
    var model = placemark.getGeometry();
    
    var loc = ge.createLocation('');
    loc.setLatLngAlt(pos[0], pos[1], pos[2]);
    model.setLocation(loc);
    if (id != 'localPlayerModel') {
        //another player
        if (model.getLink().getHref() != modelLocation) {
            var link = ge.createLink('');
            link.setHref(modelLocation);
            model.setLink(link);
        }
    }else
    if (lastModel != modelLocation ) {
        var link = ge.createLink('');
        link.setHref(modelLocation);
        model.setLink(link);
        if (id == 'localPlayerModel') {
            lastModel = modelLocation;
        }
        //Also gonna change camera here... TODO: do this right...
        if (id == 'localPlayerModel') {
            switch (modelLocation) {
                case MAN_MODEL_LOCATION:
                    MODEL_DISTANCE_FROM_CAMERA = 5.0;
                    cameraAltitude = 3.0;
                    break;
                case CAR_MODEL_LOCATION:
                    MODEL_DISTANCE_FROM_CAMERA = 25.0;
                    cameraAltitude = 10.5;
                    break;
                case PLANE_MODEL_LOCATION:
                    MODEL_DISTANCE_FROM_CAMERA = 30.0;
                    cameraAltitude = 13.0;
                    break;
                default:
                    MODEL_DISTANCE_FROM_CAMERA = 5.0;
                    cameraAltitude = 3.0;
                    break;

            }
        }
    }
    var orientation = model.getOrientation();
    orientation.set(fixAngle(heading * 180 / Math.PI) + 180, /* heading */
                me.tiltAngle, /* tilt*/
                0 /*roll, for now, 0*/);
}


function stopMoving() {
    turnLeft = false;
    turnRight = false;
    strafeLeft = false;
    strafeRight = false;
    moveForward = false;
    moveBackward = false;
}
function setTravelMode(mode) {
    stopMoving();
    TRAVEL_MODE = mode;
    switch (mode) {
        case MODE_WALKING:
            me.characterLla[2] = 0;
            me.characterCartesian = V3.latLonAltToCartesian(me.characterLla);
            break;
        case MODE_DRIVING:
            me.characterLla[2] = 0;
            me.characterCartesian = V3.latLonAltToCartesian(me.characterLla);
            break;
        case MODE_FLYING:
            break;
    }
    me.tiltAngle = -0.21362830044410586;
}
