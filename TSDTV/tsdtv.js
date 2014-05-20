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
	var maxWidth = window.innerWidth; // Max width for the image
    var maxHeight = window.innerHeight; // Max height for the image
    //var width = vlc.width();    // Current image width
    //var height = vlc.height();  // Current image height
    var availableWidth = maxWidth - ($('.tsd-control-container').width() * 2.5);
	var availableHeight = maxHeight - ($('.tsd-header').height() + $('.tsd-note-container').height() + $('.tsd-footer').height() + 32); 

    setNewWidth(availableWidth, availableHeight);
}

function setNewWidth(maxWidth, maxHeight){
      $('#vlc').css("width", maxWidth); // Set new width
      $('#vlc').css("height", maxHeight);  // Scale height based on ratio
      $('.tsd-tv-content').css('width', maxWidth);
      $('.tsd-tv-content').css('height', maxHeight);
      height = maxHeight;    // Reset height to match scaled image
      width = maxWidth;    // Reset width to match scaled image
}

$('.tsd-mute').click(function(){
	var vlc = document.getElementById("vlc");
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

function tsdtvStatus(){
  
}

