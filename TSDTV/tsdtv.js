//TSDTV - v2

function vlcAspectRatio(){
	var vlc = $('#vlc');
	var maxWidth = window.innerWidth; // Max width for the image
    var maxHeight = window.innerHeight; // Max height for the image
    //var width = vlc.width();    // Current image width
    //var height = vlc.height();  // Current image height
   /* if(thing = hidden){
    var availableWidth = maxWidth - 50;
    }else{*/
    var availableWidth = maxWidth - ($('.tsd-control-container').width() * 2.5);
	//}
	var availableHeight = maxHeight - ($('.tsd-header').height() + $('.tsd-note-container').height() + $('.tsd-footer').height() + 32); 

    setNewWidth(availableWidth, availableHeight);
}

function setNewWidth(maxWidth, maxHeight){
      $('#vlc').css("width", maxWidth); // Set new width
      $('#vlc').css("height", maxHeight);  // Scale height based on ratio
      $('.tsd-tv-content').css('width', maxWidth);
      $('.tsd-tv-content').css('height', maxHeight);
     // height = maxHeight;    // Reset height to match scaled image
     // width = maxWidth;    // Reset width to match scaled image
}

function tsdtvStatus(){
	var vlc = document.getElementById("vlc");
	console.log(vlc.input.state);
	if (vlc.input.hasVout){
		console.log("TSDTV: Online");
	}else if(!vlc.input.hasVout){
		console.log("TSDTV: Offline");
	}
}


$(document).ready(function(){
	var vlc = $('#vlc');
	vlcAspectRatio();
	vlc.allofthelights(delay_turn_on = 1000);
	tsdtvStatus();
});



$(".light-switch").hover(
  function() {
    $('#light-svg').css('fill','#FFF');
    $('#bg-svg').css('fill','rgb(85,85,85)');
  }, function() {
    $('#light-svg').css('fill','#030027');
    $('#bg-svg').css('fill','#A4A4A4');
});

$(window).bind("resize", function(){
	//console.log(window.innerHeight, window.innerWidth);
	vlcAspectRatio();
});

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
$('.tsdtv-test').click(function(){
	var vlc = $('#vlc');
	vlc.attr("target","drumvid.mov");
});

$('.tsd-status').click(function(){
	if($('.tsd-status').hasClass('tsd-status-inactive')){
		$('.tsd-off').removeClass('tsd-off-inactive').addClass('tsd-off-active');
		$('.tsd-on').removeClass('tsd-on-inactive').addClass('tsd-on-active');
		$('.tsd-status').addClass('tsd-status-active').removeClass('tsd-status-inactive');
	}else if($('.tsd-status').hasClass('tsd-status-active')){
		$('.tsd-off').removeClass('tsd-off-active').addClass('tsd-off-inactive');
		$('.tsd-on').removeClass('tsd-on-active').addClass('tsd-on-inactive');
		$('.tsd-status').addClass('tsd-status-inactive').removeClass('tsd-status-active');
	}
});




