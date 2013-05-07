//the goal here is to maintain timers

var startTimes = {};

var time;
var currentTime;

function registerTimer(key) {
    updateCurrentTime();
    startTimes.put(key, currentTime);
}

function getTimeDiff(key) {
    updateCurrentTime();
    var diff = currentTime - startTimes[key];
    return diff;
}

function updateStartTime(key) {
    updateCurrentTime();
    startTimes[key] = currentTime;
}

function getTimeDiffAndUpdate(key) {
    var diff = getTimeDiff(key);
    updateStartTime(key);
    return diff;
}

function updateCurrentTime() {
    time = new Date;
    currentTime = time.getTime();
}