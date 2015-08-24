<html>
	<head>
		<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
		<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">

		<!-- Optional theme -->
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap-theme.min.css">

		<!-- Latest compiled and minified JavaScript -->
		<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>
		<style>
			body {
  				background-color: navy;
			}
			button.btn {
  				margin-top: 5px;
  				font-size: 20px;
  				margin-bottom: 5px;
  				padding-top: 32px;
  				padding-bottom: 32px;
  				font-size: 20px;
			}

			.sb-title {
				text-align: center;
				background-color: skyblue;
				position: fixed;
				width: 100%;
				z-index: 1;
				border-bottom: 2px solid white;
			}

			.sb-body {
				margin-top: 80px;
			}

		</style>
		
	</head>
	<body>
		
		<div class="container-fluid">
			<div class="row sb-title">
					<h1>TSDSB</h1>
				</div>
			<div id="sb-body" class="row sb-body">
				
			</div>
		</div>
	</body>
	<script>

		<?php
			$dir = '/var/www/html/tsd/src/';
			$files = scandir($dir);
			unset($files[0]);
			unset($files[1]);
			
			foreach ($files as $key=>$value) {
    			$blob = audioObjectBuilder($value);
    			$arrBlob[$key] = $blob;
			}

			$name_array = json_encode($files);
			$blob_array = json_encode($arrBlob);

			echo "var song_list.name = ". $name_array . ";\n";
			echo "var song_list.file = ". $blob_array . ";\n";

			
			function string2url($string) {  
				 $chaine = trim($string);  
				 $chaine = strtr($string,  
				"ÀÁÂÃÄÅàáâãäåÒÓÔÕÖØòóôõöøÈÉÊËèéêëÇçÌÍÎÏìíîïÙÚÛÜùúûüÿÑñ",  
				"aaaaaaaaaaaaooooooooooooeeeeeeeecciiiiiiiiuuuuuuuuynn");  
				 $chaine = strtr($string,"ABCDEFGHIJKLMNOPQRSTUVWXYZ","abcdefghijklmnopqrstuvwxyz");  
				 $chaine = preg_replace('#([^.a-z0-9]+)#i', '-', $string);  
						$chaine = preg_replace('#-{2,}#','-',$string);  
						$chaine = preg_replace('#-$#','',$string);  
						$chaine = preg_replace('#^-#','',$string);  
						$chaine = str_replace(' ','%20',$string);
						$chaine = str_replace("'","\'",$string);
				 return $chaine;  
			}

			function audioObjectBuilder($value){
				$path = '/var/www/html/tsd/src/' . $value;
				$type = pathinfo($path, PATHINFO_EXTENSION);
				$data = file_get_contents($path);
				$base64 = 'data:audio/' . $type . ';base64,' . base64_encode($data);
				return $base64;
			}
		?>
				$.each(song_list.name,function(i){
					var songHtml = [
						"<div class='col-xs-12 col-md-4'><audio id='player"+i+"' src='src/"+song_list.file[i]+"' style='display:none;' preload='none' onended='reset("+i+")'></audio>",
						"<button id='btn"+i+"' class='btn btn-primary col-xs-9' onclick='play("+i+")'>"+song_list.name[i]+" </button>",
						"<button class='btn btn-primary col-xs-3 stop-"+i+"' onclick='stop("+i+")'>Stop </button></div>"
					];
					songHtml = songHtml.join("");
					$("#sb-body").append(songHtml);

					$("#btn"+i).click(function(){
						var audio = document.createElement("audio");
        				audio.src = song_list.file[i];
        				audio.addEventListener("ended", function () {
            				document.removeChild(this);
        				}, false);
        				audio.play();   
					});
					

				});

			function play(x){
				//document.getElementById('player' + x).pause();
				//document.getElementById('player' + x).src = 'src/' + document.getElementById('btn' + x).innerHTML;
				//document.getElementById('player' + x).currentTime = 0;
				//document.getElementById('player' + x).play();
				$('#btn'+x).addClass('btn-success').removeClass('btn-primary');
				$('.stop-'+x).addClass('btn-danger').removeClass('btn-primary');
			}

			function stop(x){
				//document.getElementById('player' + x).pause();
				//document.getElementById('player' + x).currentTime = 0;
				$('#btn'+x).addClass('btn-primary').removeClass('btn-success');
				$('.stop-'+x).addClass('btn-primary').removeClass('btn-danger');
			}
			
			function reset(x){
				$('#btn'+x).addClass('btn-primary').removeClass('btn-success');
				$('.stop-'+x).addClass('btn-primary').removeClass('btn-danger');
			}
		</script>
</html>