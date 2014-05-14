//TSDTV - v2

$(document).ready(function(){
	var vlc = $('#vlc');
	vlcAspectRatio();
	vlc.allofthelights();
});	

/*$('.tsd-note-container').hover(
	function() {
		$('.tsd-note').css('visibility','visible');
	}, function() {
		$('.tsd-note').css('visibility','hidden');
	}
);*/

$(".light-switch").hover(
  function() {
    $('#light-svg').css('fill','#FFF');
    $('#bg-svg').css('fill','rgb(85,85,85)');
  }, function() {
    $('#light-svg').css('fill','#030027');
    $('#bg-svg').css('fill','#A4A4A4');
});

var vlc_size = $('#vlc');
//console.log(vlc_size);

$(window).bind("resize", function(){
	//console.log(window.innerHeight, window.innerWidth);
	vlcAspectRatio();
});

function vlcAspectRatio(){
	var vlc = $('#vlc');
	var maxWidth = window.innerWidth * 0.90; // Max width for the image
    var maxHeight = window.innerHeight * 0.70;    // Max height for the image
	var ratio = 0;  // Used for aspect ratio
    var width = vlc.width();    // Current image width
    var height = vlc.height();  // Current image height
	// Check if the current width is larger than the max
	
      ratio = maxWidth / width;   // get ratio for scaling image
      $('#vlc').attr("width", maxWidth); // Set new width
      $('#vlc').attr("height", height * ratio);  // Scale height based on ratio
      $('.tsd-tv-content').css('width', maxWidth);
      height = height * ratio;    // Reset height to match scaled image
      width = width * ratio;    // Reset width to match scaled image
}

$('.tsd-mute').click(function(){
	var vlc = document.getElementById("vlc");
	//var vlc = $('#vlc');
	vlc.audio.toggleMute();

console.log("Track Count: "+vlc.audio.count);
console.log("Channel: "+vlc.audio.channel);
console.log("Volume: "+vlc.audio.volume);
console.log(vlc.input.hasVout);
});
$('.tsd-2xv').click(function(){
	var vlc = document.getElementById("vlc");
	vlc.audio.volume = 200;
	console.log(vlc.audio.volume);
});
