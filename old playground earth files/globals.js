var WALKING_SPEED = 5;
//var MAN_MODEL_LOCATION ="http://www.owlnet.rice.edu/~jc14/test/man_model.dae";
var MAN_MODEL_LOCATION = "http://www.owlnet.rice.edu/~jc14/test/man_segway.dae";
var BEACON_LOCATION = "http://www.owlnet.rice.edu/~jc14/test/beacon.dae";
var PLANE_MODEL_LOCATION = "http://www.owlnet.rice.edu/~jc14/test/sketchup_plane.dae";
var CAR_MODEL_LOCATION = "http://www.owlnet.rice.edu/~jc14/test/car_color.dae";
var PLAYER_ARROW_LOCATION = "http://www.owlnet.rice.edu/~jc14/test/player_arrow.png";
var DIRECTORY = "localhost:38568";
var MODEL_DISTANCE_FROM_CAMERA = 5.0;
var CAMERA_ALTITUDE = 0;
var REFRESH_RATE = 25;
var COLLISION_DISTANCE = 0.00001;
var MAN_HITBOX_DIST = 1.0;
var DISTANCE_FROM_COLLISION = 3.0;
var STARTING_LOCATION = [29.719503,-95.397831,0]; //Rice  //SF [37.802061, -122.419508, 0]; //[37.79333, -122.40, 0]; //[28.418718, -81.581200, 0]; //
var DEBUG = 0;
var MODE_WALKING = 0;
var MODE_DRIVING = 1;
var MODE_FLYING = 2;
var ACCELERATION_RATE = 0.75;
var DECELERATION_RATE = 3.5;
var MAX_CAR_FORWARD = 50;
var MAX_CAR_BACKWARDS = -10;
var NATURAL_DECELERATION_RATE = 0.25;
var ROAD_CHECK_RATE = 100;
var DISTANCE_TO_ROAD_THRESHOLD = 10;
var AUTO_TRANSPORT = false;
var OTHER_PLAYER_REFRESH_RATE = 7;
var DEFAULT_EPS = .0001;
var DEFAULT_ALT_EPS = .1;
var MARKER_REFRESH_RATE = 50;
var MINIMUM_FLIGHT_SPEED = 10;
var MAXIMUM_FLIGHT_SPEED = 100;
var FLYING_ACCELERATION_RATE = 1;
var FLYING_DECELERATION_RATE = 3;
var EMPTY_GUID = "00000000-0000-0000-0000-000000000000";
var OTHER_PLAYER_REFRESH_RATE = 5;