<head>
	<link rel="stylesheet" type="text/css" href="logs.css">
</head>
<body>
<?PHP
	////////////////////// location of the log file
	$logLocation = "tsdlog.txt";
	/////////////////////
	
	//opening and reading the log file
	$log = mb_convert_encoding(file_get_contents($logLocation), "HTML-ENTITIES", "ASCII");
	$logArray = split("\n", $log);
	
	//ident of the user we're trying to help
	$u = $_GET['usr'];
	
	//getting ready to read the log, creating an array where we will store the relevant messages
	$len = count($logArray);
	$i = 0;
	$finalArray = array();
	$found = false;
	
	//searching the log file, top-down
	while($i < $len){
		//the line we are looking at
		$message = $logArray[$i];
		//checks to see if the line is a PART or QUIT message, and if it includes the user ident in question, sets the $found flag
		if((strpos(strtolower($message), strtolower('(' . $u . ')')) !== false) && ((substr($message, 0 , 3) == 'PAR') || (substr($message, 0, 3) == 'QUI'))){
			//reinitializes the array for each block between a PART and JOIN so that we are only displaying the most recent
			$finalArray = array();
			$found = true;
		}
		
		//unsets the $found flag, but still adding the JOIN line to the display
		if((strpos(strtolower($message), strtolower('(' . $u . '@')) !== false) && (substr($message, 0 , 3) == 'JOI')){
			array_push($finalArray, $logArray[$i]);
			$found = false;
		}
		
		//adds the line to our new array if it's what we want
		if($found){
			array_push($finalArray, $logArray[$i]);
		}
		$i++;
	}
	
	//Apologizes if we couldn't calculate a proper recap. may happen if the user doesn't have a proper quit/join period within the log range
	if(count($finalArray) <= 1){
		echo "Sorry, I couldn't calculate a recap for you. You can view the last 15 minutes of chat <a href='reader.php?len=15'>here.</a>";
	}
	
	//printing the messages in the array, top to bottom
	$x = 0;
	while($x<count($finalArray)){
		//full, unparsed line
		$line = $finalArray[$x];
		//splitting the line by looking at multiple spaces, limiting it so that it doesnt try and parse the user messages
		$lineArr = preg_split('/  +/', $line, 7);
		//parsing out the message time and type
		$time = $lineArr[2];
		$type = $lineArr[0];
		//checking if its a normal message or any other message type
		if ($type == 'MESSAGE'){
			//user and message are only seperated by '||', so they have to get parsed seperately
			$userandmessage = $lineArr[4];
			$user = explode("||", $userandmessage, 2)[0];
			$message = explode("||", $userandmessage, 2)[1];
			//printing the message
			echo '<span class = "timestamp">' . $time . '</span>&nbsp;<span class = "user">&lt;' . $user . '&gt;</span>&nbsp;<span class = "message" >' . $message . '</span>';
		}
		else{
			//prints the message as it appears. sets the 'class' to whatever the message type is; each have their own set of colors in the css
			echo '<span class = "timestamp">' . $time . '</span><span class="' . $type . '">' . $lineArr[3] . '</span>';
		}
		//dat newline
		echo '<br />';
		$x++;
	}
?>
</body>