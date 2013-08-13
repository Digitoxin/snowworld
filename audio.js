var footStepBuffer = null;

window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();

function loadSound(url, targetBuffer){
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    request.onload = function(){
        context.decodeAudioData(request.response, function(buffer){
            targetBuffer = buffer;
            playSound(targetBuffer);
        }, function(){});
    };
    request.send();
}

loadSound("step.ogg", footStepBuffer);

function playSound(buffer){
    source = context.createBufferSource();
    source.loop = true;
    source.buffer = buffer;

    source.connect(context.destination);

    source.start(0);
}