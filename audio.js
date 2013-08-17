var footStepBuffer = null;
var musicBuffer = null;

var context;
if (!!window.AudioContext || !!window.webkitAudioContext){
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    context = new AudioContext();
    
    loadSound("step.wav", footStepBuffer);
    loadSound("BGM_008.WAV", musicBuffer);
} else {
    console.log("No sound for you :C");
}

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

function playSound(buffer){
    source = context.createBufferSource();
    source.loop = true;
    source.buffer = buffer;

    source.connect(context.destination);

    source.start(0);
}
