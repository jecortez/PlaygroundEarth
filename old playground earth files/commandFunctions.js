function parseCommands() {
    if(commandList != null && commandList.length > 0) {
        var command;
        //takes them off the front and until none are left
        while(command = commandList.shift()) {
            if (command.name == "Teleport") {
                teleportCommand(command);
            }
            else if (command.name == "EndRace") {
                endRaceCommand(command);
            }
            else if (command.name == "NameChange") {
                nameChangeCommand(command);
            }
            else if (command.name == "FillPopup") {
                fillPopupCommand(command);
            }
            else if (command.name == "DeleteMarker") {
                deleteMarkerCommand(command);
            }
            else if (command.name == "DeleteBeacon") {
                deleteBeaconCommand(command);
            }
            else if (command.name == "CreateBeacon") {
                createBeaconCommand(command);
            }
            else {
                alert("just got an unknown command..." + command.name);
            }
        }
    }
}

function teleportCommand(command) {
    if(DEBUG)alert("in teleport command: " + command);
    var pos0 = command.Position.pos0;
    var pos1 = command.Position.pos1;
    var pos2 = command.Position.pos2;
    me.characterLla[0] = pos0;
    me.characterLla[1] = pos1;
    me.characterLla[2] = pos2;
    me.characterCartesian = V3.latLonAltToCartesian(me.characterLla);
}

function fillPopupCommand(command) {
    var pos0 = command.Position.pos0;
    var pos1 = command.Position.pos1;
    var pos2 = command.Position.pos2;

    var htmlString = command.HTMLString;

    var pos = new google.maps.LatLng(pos0, pos1)

    createMarker(pos, command.MarkerTitle, htmlString);
}

function nameChangeCommand(command) {
    if (DEBUG) document.getElementById("playerNameTag").innerHTML = command.newName;
    alert("Named Changed to "+command.newName+".");
}

function endRaceCommand(command) {
    
    //perhaps write this out to a nice place for the user?
    stopMoving();
    
    alert(command.resultMessage);
    //TODO HERE just place the code to remove the beacon(s?) that are currently live
    removeModel(lastRacesList[0].ID);
    removeModel(lastRacesList[0].ID + 'b2');
}

function deleteMarkerCommand(command) {
    removeMarker(command.MarkerTitle);
}

function createBeaconCommand(command) {
    //here we need to create the beacon for the player to see
    //whats the beacon model loc?
    addModelAtLocation([command.Position.pos0, command.Position.pos1, command.Position.pos2], BEACON_LOCATION, command.BeaconName, 0);
}

function deleteBeaconCommand(command) {
    removeModel(command.BeaconName);
}