//TSDTV - v2

function vlcAspectRatio(showControls){
	var vlc = $('#vlc');
	var maxWidth = window.innerWidth; // Max width for the image
    var maxHeight = window.innerHeight; // Max height for the image
    var availableWidth = 0;
    if(showControls === true || showControls=== undefined){
		availableWidth = maxWidth - ($('.tsd-control-container').width() * 2.5);	
    }else if(showControls === false){
		availableWidth = maxWidth - 50;
	}
	var availableHeight = maxHeight - ($('.tsd-header').height() + $('.tsd-note-container').height() + $('.tsd-footer').height() + 32); 

    setNewWidth(availableWidth, availableHeight);
}

function setNewWidth(maxWidth, maxHeight){
      $('#vlc').css("width", maxWidth); // Set new width
      $('#vlc').css("height", maxHeight);  // Scale height based on ratio
      $('.tsd-tv-content').css('width', maxWidth);
      $('.tsd-tv-content').css('height', maxHeight);
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

function flipCard(container, oldCard, newCard, cardActive){


  var containerActive = container+'-active';
  var containerInactive = container+'-inactive';
  var oldCardActive = oldCard+'-active';
  var oldCardInactive = oldCard+'-inactive';
  var newCardActive = newCard+'-active';
  var newCardInactive = newCard+'-inactive';

  if(cardActive){

    $('.'+oldCard).removeClass(oldCardInactive).addClass(oldCardActive);
    $('.'+newCard).removeClass(newCardInactive).addClass(newCardActive);
    $('.'+container).addClass(containerActive).removeClass(containerInactive);
  }else if(!cardActive){
    $('.'+oldCard).removeClass(oldCardActive).addClass(oldCardInactive);
    $('.'+newCard).removeClass(newCardActive).addClass(newCardInactive);
    $('.'+container).addClass(containerInactive).removeClass(containerActive);
  }
}


$(document).ready(function(){
  var vlc = document.getElementById("vlc");
  vlc.video.marquee.enable();
	vlc = $('#vlc');
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
  if($('.tsd-mute').hasClass('tsd-mute-inactive')){
    flipCard('tsd-mute','mute','unmute',true);
  }else if($('.tsd-mute').hasClass('tsd-mute-active')){
    flipCard('tsd-mute','mute','unmute',false);
  }
  //console.log(vlc.input.hasVout);
});
$('.tsd-volume').click(function(){
	var vlc = document.getElementById("vlc");
  if($('.tsd-volume').hasClass('tsd-volume-inactive')){
    flipCard('tsd-volume','regv','dubv',true);
    vlc.audio.volume = 200;
  }else if($('.tsd-volume').hasClass('tsd-volume-active')){
    flipCard('tsd-volume','regv','dubv',false);
    vlc.audio.volume = 100;
  }
	//vlc.audio.volume = 200;
	
});

$('.tsd-fullscreen').click(function(){
  var vlc = document.getElementById("vlc");
  vlc.video.toggleFullscreen();
});


$('.tsdtv-test').click(function(){
	//var vlc = $('#vlc');
	//vlc.attr("target","drumvid.mov");

});

$('.tsd-status').click(function(){
	if($('.tsd-status').hasClass('tsd-status-inactive')){
		flipCard('tsd-status','tsd-off','tsd-on',true);
	}else if($('.tsd-status').hasClass('tsd-status-active')){
		flipCard('tsd-status','tsd-off','tsd-on',false);
	}
});

$('.tsdtv-test').click(function(){
  var vlc = document.getElementById("vlc");
  vlc.playlist.add('drumvid.mov');
  vlc.playlist.playItem(1);
/*
  vlc.video.marquee.text = "Schooly Was Right";
  vlc.video.marquee.color = 0x000000;
  vlc.video.marquee.opacity = 255;
  vlc.video.marquee.position = 0;
  //vlc.video.marquee.refresh 
  vlc.video.marquee.size = 20;
  vlc.video.marquee.timeout = 0;
  //vlc.video.marquee.x: 
  //vlc.video.marquee.y: 
  */
});




