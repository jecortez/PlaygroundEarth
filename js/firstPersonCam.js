// firstpersoncam.js
/*
Copyright 2008 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

// Code for a simple quake-style camera.
//
// Notes: This is a very simple camera and intended to be so. The 
// camera's altitude is always 0, relative to the surface of the
// earth.
//

//----------------------------------------------------------------------------
// Global Variables
//----------------------------------------------------------------------------

turnLeft = false;
turnRight = false;
tiltUp = false;
tiltDown = false;

moveForward = false;
moveBackward = false;
strafeLeft = false;
strafeRight = false;
altitudeUp = false;
altitudeDown = false;

var TRAVEL_MODE = 0; //MODE WALKING
var currentSpeed = 0;

var characterLocation = 0;

INITIAL_CAMERA_ALTITUDE = 2.3; // Roughly 6 feet tall
cameraAltitude = INITIAL_CAMERA_ALTITUDE;
//----------------------------------------------------------------------------
// Utility Functions
//----------------------------------------------------------------------------

// Keep an angle in [-180,180]
function fixAngle(a) {
    while (a < -180) {
        a += 360;
    }
    while (a > 180) {
        a -= 360;
    }
    return a;
}

//----------------------------------------------------------------------------
// Input Handlers
//----------------------------------------------------------------------------

function keyDown(event) {
    if (!event) {
        event = window.event;
    }
    if (event.keyCode == 33) {  // Altitude Up
        altitudeUp = true;
        //event.returnValue = false;
    } else if (event.keyCode == 34) {  // Altitude Down
        altitudeDown = true;
        //event.returnValue = false;
    } else if (event.keyCode == 37) {  // Turn Left.
        turnLeft = true;
        //event.returnValue = false;
    } else if (event.keyCode == 39) {  // Turn Right.
        turnRight = true;
        //event.returnValue = false;
    } else if (event.keyCode == 38) {  // Tilt Up.
        tiltUp = true;
        event.returnValue = false;
    } else if (event.keyCode == 40) {  // Tilt Down.
        tiltDown = true;
        event.returnValue = false;
    } else if (event.keyCode == 65 ||
             event.keyCode == 97) {  // Strafe Left.
        if (TRAVEL_MODE == MODE_WALKING) {
            strafeLeft = true;
        }
        if (TRAVEL_MODE == MODE_DRIVING) {
            if (moveBackward)
                turnRight = true;
            else
                turnLeft = true;
        }
        //event.returnValue = false;
    } else if (event.keyCode == 68 ||
             event.keyCode == 100) {  // Strafe Right.
        if (TRAVEL_MODE == MODE_WALKING) {
            strafeRight = true;
        }
        if (TRAVEL_MODE == MODE_DRIVING) {
            if (moveBackward)
                turnLeft = true;
            else
                turnRight = true;

        }
        //event.returnValue = false;
    } else if (event.keyCode == 87 ||
             event.keyCode == 119) {  // Move Forward.
        moveForward = true;
        //event.returnValue = false;
    } else if (event.keyCode == 83 ||
             event.keyCode == 115) {  // Move Forward.
        moveBackward = true;
    } else if (event.keyCode == 49) {
        setTravelMode(0);
    } else if (event.keyCode == 50) {
        setTravelMode(1);
    } else if (event.keyCode == 51) {
        setTravelMode(2);
    } else {
        return event.returnValue;
    }
    return true;
}

function keyUp(event) {
    if (!event) {
        event = window.event;
    }
    if (event.keyCode == 33) {  // Altitude Up
        altitudeUp = false;
        //event.returnValue = false;
    } else if (event.keyCode == 34) {  // Altitude Down
        altitudeDown = false;
        //event.returnValue = false;
    } else if (event.keyCode == 37) {  // Left.
        turnLeft = false;
        //event.returnValue = false;
    } else if (event.keyCode == 39) {  // Right.
        turnRight = false;
        //event.returnValue = false;
    } else if (event.keyCode == 38) {  // Up.
        tiltUp = false;
        //event.returnValue = false;
    } else if (event.keyCode == 40) {  // Down.
        tiltDown = false;
        //event.returnValue = false;
    } else if (event.keyCode == 65 ||
             event.keyCode == 97) {  // Strafe Left.
        if (TRAVEL_MODE == MODE_WALKING) {
            strafeLeft = false;
        }
        if (TRAVEL_MODE == MODE_DRIVING) {
                turnRight = false;           
                turnLeft = false;
        }
        //event.returnValue = false;
    } else if (event.keyCode == 68 ||
             event.keyCode == 100) {  // Strafe Right.
        if (TRAVEL_MODE == MODE_WALKING) {
            strafeRight = false;
        }
        if (TRAVEL_MODE == MODE_DRIVING) {
                turnLeft = false;
                turnRight = false;
        }
    } else if (event.keyCode == 87 ||
             event.keyCode == 119) {  // Move Forward.
        moveForward = false;
        //event.returnValue = false;
    } else if (event.keyCode == 83 ||
             event.keyCode == 115) {  // Move Forward.
        moveBackward = false;
    }
    return false;
}



//----------------------------------------------------------------------------
// JSObject - FirstPersonCamera
//----------------------------------------------------------------------------
var me;
function FirstPersonCam() {
    me = this;

    // The anchor point is where the camera is situated at. We store
    // the current position in lat, lon, altitude and in cartesian 
    // coordinates.
    me.localAnchorLla = STARTING_LOCATION; //[37.79333, -122.40, 0];  // San Francisco
    me.localAnchorCartesian = V3.latLonAltToCartesian(me.localAnchorLla);

    me.characterLla = STARTING_LOCATION; ; // [37.79333, -122.40, 0]; //Also San Francisco.
    me.characterCartesian = V3.latLonAltToCartesian(me.characterLla);

    // Heading, tilt angle is relative to local frame
    me.headingAngle = 0;
    me.tiltAngle = 0;

    // Initialize the time
    me.lastMillis = (new Date()).getTime();

    // Used for bounce.
    me.distanceTraveled = 0;

    // prevent mouse navigation in the plugin
    ge.getOptions().setMouseNavigationEnabled(false);

    // Updates should be called on frameend to help keep objects in sync.
    // GE does not propogate changes caused by KML objects until an
    // end of frame.
    google.earth.addEventListener(ge, "frameend",
                                function () { me.update(); });
}

FirstPersonCam.prototype.updateOrientation = function (dt) {
    me = this;

    // Based on dt and input press, update turn angle.
    if (turnLeft || turnRight) {
        var turnSpeed = 60.0; // radians/sec
        if (turnLeft)
            turnSpeed *= -1.0;
        if (TRAVEL_MODE == MODE_DRIVING && 
        currentSpeed >= 0 && currentSpeed <= 2.5){
            //Shouldn't turn
        } else {
            me.headingAngle += turnSpeed * dt * Math.PI / 180.0;
        }
    }
    if (tiltUp || tiltDown) {
        var tiltSpeed = 60.0; // radians/sec
        if (tiltDown)
            tiltSpeed *= -1.0;
        me.tiltAngle = me.tiltAngle + tiltSpeed * dt * Math.PI / 180.0;
        // Clamp
        var tiltMax = 90.0 * Math.PI / 180.0;
        var tiltMin = -90.0 * Math.PI / 180.0;
        if (me.tiltAngle > tiltMax)
            me.tiltAngle = tiltMax;
        if (me.tiltAngle < tiltMin)
            me.tiltAngle = tiltMin;
    }
}

FirstPersonCam.prototype.updatePosition = function (dt) {
    me = this;

    // Convert local lat/lon to a global matrix. The up vector is 
    // vector = position - center of earth. And the right vector is a vector
    // pointing eastwards and the facing vector is pointing towards north.
    var localToGlobalFrame = M33.makeLocalToGlobalFrame(me.localAnchorLla);

    // Move in heading direction by rotating the facing vector around
    // the up vector, in the angle specified by the heading angle.
    // Strafing is similar, except it's aligned towards the right vec.
    var headingVec = V3.rotate(localToGlobalFrame[1], localToGlobalFrame[2],
                             -me.headingAngle);
    var rightVec = V3.rotate(localToGlobalFrame[0], localToGlobalFrame[2],
                             -me.headingAngle);

    // Add the change in position due to forward velocity and strafe velocity 

    
    me.localAnchorCartesian = V3.add(me.characterCartesian,
                                    V3.scale(headingVec, -MODEL_DISTANCE_FROM_CAMERA));
    me.localAnchorLla = V3.cartesianToLatLonAlt(me.localAnchorCartesian);
    //cameraAltitude = me.localAnchorLla[2];

}

FirstPersonCam.prototype.updateCharacterPosition = function (dt) {
    me = this;

    // Convert local lat/lon to a global matrix. The up vector is 
    // vector = position - center of earth. And the right vector is a vector
    // pointing eastwards and the facing vector is pointing towards north.
    var localToGlobalFrame = M33.makeLocalToGlobalFrame(me.localAnchorLla);

    // Move in heading direction by rotating the facing vector around
    // the up vector, in the angle specified by the heading angle.
    // Strafing is similar, except it's aligned towards the right vec.
    var headingVec = V3.rotate(localToGlobalFrame[1], localToGlobalFrame[2],
                             -me.headingAngle);
    var rightVec = V3.rotate(localToGlobalFrame[0], localToGlobalFrame[2],
                             -me.headingAngle);
    //if(!checkCollision(V3.add(me.characterCartesian, V3.scale(headingVec,forward)),COLLISION_DISTANCE){
    //me.characterCartesian = V3.add(me.characterCartesian, V3.scale(headingVec, forward));

    //}
    // Convert cartesian to Lat Lon Altitude for camera setup later on.
    // Calculate strafe/forwards                              
    var strafe = 0;
    if (strafeLeft || strafeRight) {
        var strafeVelocity = WALKING_SPEED;
        if (strafeLeft)
            strafeVelocity *= -1;
        strafe = strafeVelocity * dt;
    }
    var forward = 0;
    switch (TRAVEL_MODE) {
        case MODE_DRIVING:
            if (moveForward) {
                currentSpeed += ACCELERATION_RATE;
                if (currentSpeed >= MAX_CAR_FORWARD) {
                    currentSpeed = MAX_CAR_FORWARD;
                }
            }
            if (moveBackward) {
                currentSpeed -= DECELERATION_RATE;
                if (currentSpeed <= MAX_CAR_BACKWARDS) {
                    currentSpeed = MAX_CAR_BACKWARDS;
                }

            }
            if (!moveBackward && !moveForward) {
                currentSpeed -= NATURAL_DECELERATION_RATE;
                if (currentSpeed <= 0)
                    currentSpeed = 0;
            }
            break;
        case MODE_WALKING:
            //Initialize to 0;
            currentSpeed = 0;
            if (moveForward) {
                currentSpeed = WALKING_SPEED;
            }
            if (moveBackward) {
                currentSpeed = -WALKING_SPEED;
            }

            break;
        case MODE_FLYING:
            if (moveForward) {
                currentSpeed += FLYING_ACCELERATION_RATE;
            }
            if (moveBackward) {
                currentSpeed -= FLYING_DECELERATION_RATE;

            }
            if (currentSpeed >= MAXIMUM_FLIGHT_SPEED) {
                currentSpeed = MAXIMUM_FLIGHT_SPEED;
            }
            if (currentSpeed <= MINIMUM_FLIGHT_SPEED) {
                currentSpeed = MINIMUM_FLIGHT_SPEED;
            }
        default:
            break;

    }


    forwardVelocity = currentSpeed;
    forward = forwardVelocity * dt;
    if (altitudeUp) {
        cameraAltitude += 1.0;
    } else if (altitudeDown) {
        cameraAltitude -= 1.0;
    }
    cameraAltitude = Math.max(0, cameraAltitude);

    me.distanceTraveled += forward;
    //checking for and fixing collisions HERE:


    var hitBoxF = V3.cartesianToLatLonAlt(V3.add(me.characterCartesian, V3.scale(headingVec, MAN_HITBOX_DIST)));
    var hitBoxB = V3.cartesianToLatLonAlt(V3.add(me.characterCartesian, V3.scale(headingVec, -MAN_HITBOX_DIST)));
    var hitBoxL = V3.cartesianToLatLonAlt(V3.add(me.characterCartesian, V3.scale(rightVec, -MAN_HITBOX_DIST)));
    var hitBoxR = V3.cartesianToLatLonAlt(V3.add(me.characterCartesian, V3.scale(rightVec, MAN_HITBOX_DIST)));
    //FRONT
    //document.getElementById("debug").innerHTML = "";
    var collisionDebugStr;
    if (checkCollision(hitBoxF, COLLISION_DISTANCE)) {
        me.characterCartesian = V3.add(me.characterCartesian,
                                   V3.scale(headingVec, -MAN_HITBOX_DIST));
        collisionDebugStr += "Front \n";
    }
    // BACK
    if (checkCollision(hitBoxB, COLLISION_DISTANCE)) {
        me.characterCartesian = V3.add(me.characterCartesian,
                                   V3.scale(headingVec, MAN_HITBOX_DIST));
        collisionDebugStr += "Back \n";
    }
    //LEFT
    if (checkCollision(hitBoxL, COLLISION_DISTANCE)) {
        me.characterCartesian = V3.add(me.characterCartesian,
                                   V3.scale(rightVec, MAN_HITBOX_DIST));
        collisionDebugStr += "Left \n";
    }
    //RIGHT
    if (checkCollision(hitBoxR, COLLISION_DISTANCE)) {
        me.characterCartesian = V3.add(me.characterCartesian,
                                   V3.scale(rightVec, -MAN_HITBOX_DIST));
        collisionDebugStr += "Right \n";
    }
    // if (DEBUG) {
        // document.getElementById("debug").innerHTML += collisionDebugStr;
    // }
    /*
    if (checkCollision(me.characterLla, COLLISION_DISTANCE)) {
    me.characterCartesian = V3.add(me.characterCartesian,
    V3.scale(headingVec, -MAN_HITBOX_DIST));
    me.characterCartesian = V3.add(me.characterCartesian,
    V3.scale(headingVec, -WALKING_SPEED * 0.25));
    me.characterLla = V3.cartesianToLatLonAlt(me.characterCartesian);
    }
    */

    if (TRAVEL_MODE == MODE_FLYING) {
        //also need to add the tilt angle to that.
        var upVec = V3.rotate(localToGlobalFrame[0], localToGlobalFrame[1], -me.tiltAngle);
        upVec[0] = 0;
        upVec[1] = 0;
        if (me.characterLla[2] < -0.5) {
            me.characterLla[2] = 0;
            //upVec[2] = 1;
            setTravelMode(MODE_WALKING);
        }

        //headingVec = V3.add(headingVec, V3.scale(upVec, forward));
        me.characterCartesian = V3.add(me.characterCartesian,
                                   V3.scale(upVec, forward));


    }
    else {
        //TODO: add physics here

        me.characterLla[2] = 0;
        //me.characterCartesian = V3.latLonAltToCartesian(me.characterLla);
    }

    // Add the change in position due to forward velocity and strafe velocity 
    me.characterCartesian = V3.add(me.characterCartesian,
                                   V3.scale(rightVec, strafe));
    me.characterCartesian = V3.add(me.characterCartesian,
                                   V3.scale(headingVec, forward));
    me.characterLla = V3.cartesianToLatLonAlt(me.characterCartesian);
    if (TRAVEL_MODE != MODE_FLYING) {
        me.characterLla[2] = 0;
        //me.characterCartesian = V3.latLonAltToCartesian(me.characterLla);
    }



// 
    // //Updating the map here.
    // if (forward || strafe) {
        // var myPosition = new google.maps.LatLng(me.characterLla[0], me.characterLla[1])
        // map.panTo(myPosition);
        // //localPlayerMarker.setPosition(myPosition);
    // }

}



FirstPersonCam.prototype.updateCamera = function () {
    me = this;

    var lla = me.localAnchorLla;
    lla[2] = ge.getGlobe().getGroundAltitude(lla[0], lla[1]);

    // Will put in a bit of a stride if the camera is at or below 1.7 meters
    var bounce = 0;
    if (cameraAltitude <= INITIAL_CAMERA_ALTITUDE /* 1.7 */) {
        bounce = 1.5 * Math.abs(Math.sin(4 * me.distanceTraveled / 100 *
                                     Math.PI / 180));
    }

    // Update camera position. Note that tilt at 0 is facing directly downwards.
    //  We add 90 such that 90 degrees is facing forwards.
    var camera = ge.getView().copyAsCamera(ge.ALTITUDE_RELATIVE_TO_GROUND);
    var cameraTilt = me.tiltAngle * 180 / Math.PI + 90;
    var cameraAlt;
    switch (TRAVEL_MODE) {
        case MODE_WALKING:
            MODEL_DISTANCE_FROM_CAMERA = 5.0;
            cameraAlt = 3.0;
            break;
        case MODE_DRIVING:
            MODEL_DISTANCE_FROM_CAMERA = 25.0;
            cameraAlt = 10.5;
            break;
        case MODE_FLYING:
            MODEL_DISTANCE_FROM_CAMERA = 30.0;
            cameraAlt = 13.0;
            break;
        default:
            MODEL_DISTANCE_FROM_CAMERA = 5.0;
            cameraAlt = 3.0;
            break;

    }
    if (TRAVEL_MODE == MODE_FLYING) {
        cameraTilt = 90;
        cameraAlt = me.characterLla[2];
    }
    camera.set(me.localAnchorLla[0], me.localAnchorLla[1],
    cameraAlt,
    ge.ALTITUDE_RELATIVE_TO_GROUND,
    fixAngle(me.headingAngle * 180 / Math.PI), /* heading */
    cameraTilt, /* tilt */
    0 /* altitude is constant */
    );
    ge.getView().setAbstractView(camera);
    //document.getElementById("debug").innerHTML = me.tiltAngle * 180 / Math.PI + 90;

   
        // // content element of a rich marker
    // var richMarkerContent = document.createElement('div');

    // // arrow image
    // var arrowImage = new Image();
    // arrowImage.src = PLAYER_ARROW_LOCATION;

    // rotation in degree
    var directionDeg = fixAngle(me.headingAngle * 180 / Math.PI);

    // // create a container for the arrow
    // var rotationElement = document.createElement('div');
    // var rotationStyles = 'display:block;' +
                       // '-ms-transform:      rotate(%rotationdeg);' +
                       // '-o-transform:       rotate(%rotationdeg);' +
                       // '-moz-transform:     rotate(%rotationdeg);' +
                       // '-webkit-transform:  rotate(%rotationdeg);';
// 
    // // replace %rotation with the value of directionDeg
    // rotationStyles = rotationStyles.split('%rotation').join(directionDeg);
// 
    // rotationElement.setAttribute('style', rotationStyles);
    // rotationElement.setAttribute('alt', 'arrow');
// 
    // // append image into the rotation container element
    // rotationElement.appendChild(arrowImage);
// 
    // // append rotation container into the richMarker content element
    // richMarkerContent.appendChild(rotationElement);

    // // create a rich marker ("position" and "map" are google maps objects)
    // if (localPlayerMarker != null) {
        // localPlayerMarker.setMap(null);
        // localPlayerMarker = null;
        // }
        // localPlayerMarker = new RichMarker(
        // {
            // position: new google.maps.LatLng(me.characterLla[0], me.characterLla[1]),
            // map: map,
            // draggable: false,
            // flat: true,
            // anchor: RichMarkerPosition.MIDDLE,
            // content: richMarkerContent.innerHTML
        // }
    // );

};



FirstPersonCam.prototype.update = function () {
    me = this;

    ge.getWindow().blur();

    // Update delta time (dt in seconds)
    var now = (new Date()).getTime();
    var dt = (now - me.lastMillis) / 1000.0;
    if (dt > 0.25) {
        dt = 0.25;
    }
    me.lastMillis = now;

    // Update orientation and then position  of camera based
    // on user input   
    me.updateOrientation(dt);
    me.updateCharacterPosition(dt);
    me.updatePosition(dt);

    // Update camera
    me.updateCamera();
};