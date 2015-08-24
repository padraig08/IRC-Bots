<head>
	<link rel="stylesheet" type="text/css" href="logs.css">
</head>
<body>
<?PHP
	////////////////////// location of the log file
	$logLocation = "tsdlog.txt";
	/////////////////////
	
	//Opening and reading the log file
	$log = mb_convert_encoding(file_get_contents($logLocation), "HTML-ENTITIES", "ASCII");
	$logArray = split("\n", $log);
	
	//Initializes the recap time, displays errors if the format is incorrect
	$t = $_GET['len'];
	if (!is_numeric($t)){
		echo "that's not a number";
		return;
	}
	if ($t <= 0){
		echo "that's not quite right";
		return;
	}
	
	//Initializes the current time and the time of the first message to display (current - interval)
	$datetime = date('M d H:i', time());
	$target = date('M d H:i', strtotime($datetime) - (60 * $t));
	
	//moving the contents of the log into a new array as long as the given message is within the interval. reads the arrray bottom to top
	$len = count($logArray);
	$i = 0;
	$finalArray = array();
	while($i <= $len){
		$messageTime = date('M d H:i', strtotime(explode("]", explode("[", $logArray[$len - $i], 2)[1], 2)[0]));
		if(strtotime($messageTime) >= strtotime($target)){
			array_push($finalArray, $logArray[$len - $i]);
		}
		$i++;
	}
	
	//displays an apology if there are no messages within the given interval
	if(count($finalArray) == 1){
		echo "Sorry, there are no messages within the last " . $t ." minutes.";
	}
	
	
	//printing the messages within the new array, bottom to top
	$x = count($finalArray);
	while($x>0){
		//full, unparsed line
		$line = $finalArray[$x - 1];
		//splitting the line by looking at multiple spaces, limiting it so that it doesnt try and parse the user messages
		$lineArr = preg_split('/  +/', $line, 7);
		//parsing out the message time and the message type
		$time = $lineArr[2];
		$type = $lineArr[0];
		//checking if it's a normal message or any other message type
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
		$x--;
	}
?>
</body>