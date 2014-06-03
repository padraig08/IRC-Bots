//TSDTV - v2

function vlcAspectRatio(showControls){
	var vlc = $('#vlc');
	var maxWidth = window.innerWidth; // Max width for the image
    var maxHeight = window.innerHeight; // Max height for the image
    var availableWidth = 0;
    var availableHeight = 0;
  if(maxWidth <= 1000){
      $('.tsd-tv-container').css('overflow','hidden');
      availableWidth = maxWidth - 10;
      availableHeight = maxHeight - ($('.tsd-header').height() + $('.tsd-note-container').height() + $('.tsd-footer').height() + $('.tsd-control-container').height() + 32); 
  }else if (maxWidth>1000){
    $('.tsd-tv-container').css('overflow','visible');
    if(showControls === true || showControls=== undefined){
		availableWidth = maxWidth - ($('.tsd-control-container').width() * 2.5);	
    }else if(showControls === false){
		availableWidth = maxWidth - 50;
    }
    availableHeight = maxHeight - ($('.tsd-header').height() + $('.tsd-note-container').height() + $('.tsd-footer').height() + 32); 
  }
    setNewWidth(availableWidth, availableHeight);
}

function setNewWidth(maxWidth, maxHeight){
      $('#vlc').css("width", maxWidth); // Set new width
      $('#vlc').css("height", maxHeight);  // Scale height based on ratio
      $('.tsd-tv-content').css('width', maxWidth);
      $('.tsd-tv-content').css('height', maxHeight);
}

/*function tsdtvStatus(){
	var vlc = document.getElementById("vlc");
	console.log(vlc.input.state);
	if (vlc.input.hasVout){
		console.log("TSDTV: Online");
	}else if(!vlc.input.hasVout){
		console.log("TSDTV: Offline");
	}
}*/

function flipCard(container, oldCard, newCard, oldState, newState){

    $('.'+oldCard).removeClass('active').addClass('inactive');
    $('.'+newCard).removeClass('inactive').addClass('active');
    $('.'+container).addClass(newState).removeClass(oldState);
  
}


$(window).bind("load", function() {
	var vlc = document.getElementById("vlc");
	vlc.playlist.add('http://irc.teamschoolyd.org:8090/premium.flv');
	vlc.playlist.add('http://irc.teamschoolyd.org:8090/poverty.flv');
	//vlc.playlist.add('drumvid.mov');
	vlc.playlist.playItem(0);
	vlc.video.logo.enable();
});



$(document).ready(function(){
	var vlc = $('#vlc');
	//var player = VLCobject.embedVLC('vlc', 400, 300, true);
	vlcAspectRatio();

	vlc.allofthelights({
		'is_responsive':true,
		'callback_turn_off':function(){
			$('.tsd-control-container').fadeOut();
			vlcAspectRatio(false);
		},
		'callback_turn_on':function(){
			$('.tsd-control-container').fadeIn();
			vlcAspectRatio(true);
		},
		'z-index':10
	});
	//tsdtvStatus();
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
  if($('.tsd-mute').hasClass('control-unmute')){
    flipCard('tsd-mute','unmute','mute','control-unmute','control-mute');
    vlc.audio.toggleMute();
  }else if($('.tsd-mute').hasClass('control-mute')){
    flipCard('tsd-mute','mute','unmute','control-mute','control-unmute');
    vlc.audio.toggleMute();
  }
});

$('.volume-down').click(function(){
  var vlc = document.getElementById("vlc");
  if($('.tsd-volume').hasClass('control-twohundred')){
    flipCard('tsd-volume','twohundredv','hundredfiftyv','control-twohundred','control-hundredfifty');
    vlc.audio.volume = 150;
  }else if($('.tsd-volume').hasClass('control-hundredfifty')){
    flipCard('tsd-volume','hundredfiftyv','hundredv','control-hundredfifty','control-hundred');
    vlc.audio.volume = 100;
  }else if($('.tsd-volume').hasClass('control-hundred')){
    flipCard('tsd-volume','hundredv','fiftyv','control-hundred','control-fifty');
    vlc.audio.volume = 50;
  }  
});

$('.volume-up').click(function(){
	var vlc = document.getElementById("vlc");
  if($('.tsd-volume').hasClass('control-fifty')){
    flipCard('tsd-volume','fiftyv','hundredv','control-fifty','control-hundred');
    vlc.audio.volume = 100;
  }else if($('.tsd-volume').hasClass('control-hundred')){
    flipCard('tsd-volume','hundredv','hundredfiftyv','control-hundred','control-hundredfifty');
    vlc.audio.volume = 150;
  }else if($('.tsd-volume').hasClass('control-hundredfifty')){
    flipCard('tsd-volume','hundredfiftyv','twohundredv','control-hundredfifty','control-twohundred');
    vlc.audio.volume = 200;
  }
	
});

$('.tsd-fullscreen').click(function(){
  var vlc = document.getElementById("vlc");
  vlc.video.toggleFullscreen();
});

$('.tsd-status').click(function(){
	if($('.tsd-quality').hasClass('control-off')){
    flipCard('tsd-quality','off','on','control-off','control-on');
  }else if($('.tsd-quality').hasClass('control-lq')){
    flipCard('tsd-quality','on','off','control-on','control-off');
  }
});

$('.tsd-quality').click(function(){
  var vlc = document.getElementById("vlc");
  if($('.tsd-quality').hasClass('control-hq')){
    flipCard('tsd-quality','hq-stream','lq-stream','control-hq','control-lq');
    vlc.playlist.playItem(1);
  }else if($('.tsd-quality').hasClass('control-lq')){
    flipCard('tsd-quality','lq-stream','hq-stream','control-lq','control-hq');
    vlc.playlist.playItem(1);
  }
});


$('.tsd-playToggle').click(function(){
  var vlc = document.getElementById("vlc");
  if($('.tsd-playToggle').hasClass('control-play')){
    flipCard('tsd-playToggle','play','pause','control-play','control-pause');
    vlc.playlist.togglePause();
  }else if($('.tsd-playToggle').hasClass('control-pause')){
    flipCard('tsd-playToggle','pause','play','control-pause','control-play');
    vlc.playlist.togglePause();
  }

});

$('.rate-down').click(function(){
  var vlc = document.getElementById("vlc");
  if($('.tsd-rate').hasClass('control-twor')){
    flipCard('tsd-rate','twor','onehalfr','control-twor','control-onehalfr');
    vlc.input.rate = 1.5;
  }else if($('.tsd-rate').hasClass('control-onehalfr')){
    flipCard('tsd-rate','onehalfr','oner','control-onehalfr','control-oner');
    vlc.input.rate = 1;
  }else if($('.tsd-rate').hasClass('control-oner')){
    flipCard('tsd-rate','oner','halfr','control-oner','control-halfr');
    vlc.input.rate = 0.5;
  }  
});

$('.rate-up').click(function(){
  var vlc = document.getElementById("vlc");
  if($('.tsd-rate').hasClass('control-halfr')){
    flipCard('tsd-rate','halfr','oner','control-halfr','control-oner');
    vlc.input.volume = 1;
  }else if($('.tsd-rate').hasClass('control-oner')){
    flipCard('tsd-rate','oner','onehalfr','control-oner','control-onehalfr');
    vlc.input.rate = 1.5;
  }else if($('.tsd-rate').hasClass('control-onehalfr')){
    flipCard('tsd-rate','onehalfr','twor','control-onehalfr','control-twor');
    vlc.input.rate = 2.0;
  }
  
});


