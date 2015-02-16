$(document).ready(function(){

        var vlc = $('#vlc');
            vlc.allofthelights({
                'is_responsive':false,
                'callback_turn_off':function(){
                    $('.schsidebar').fadeOut();
                },
                'callback_turn_on':function(){
                    $('.schsidebar').fadeIn();
                },
                'z-index':10
                });
        

    $('.mute').click(function(){
        console.log("mute");
    var vlc = document.getElementById("vlc");
    vlc.audio.toggleMute();
    });

    $('.play').click(function(){
    var vlc = document.getElementById("vlc");
    vlc.playlist.togglePause();
    });

    $('.full').click(function(){
    var vlc = document.getElementById("vlc");
    vlc.video.toggleFullscreen();
    });

      /*  var schedule_call = function() {
            $.get('/tsdtv/np',{},function(responseText) {
                $('#schedule').html(responseText);
            });
        };

        var interval = 1000 * 10; // every 20 seconds
        setInterval(schedule_call, interval);
*/
});