var app = angular.module('mysite', ['ngRoute', 'duScroll'])

app.config(function ($routeProvider, $locationProvider){
    $locationProvider.hashPrefix('');
	$routeProvider		//provide url routing
		.when('/home',
			{
			templateUrl:'html/home.html',
            controller:'homeCtrl'
			})
		.when('/playground/game1',
			{
			url: '/playground/pong-game',
			controller: 'game1ctrl',
			templateUrl:'html/playground.pong.html'
			})
	    .otherwise({
            redirectTo:'/home'
        });
});

app.controller('homeCtrl', function($scope,$log) {
	$scope.currView = "";

	$scope.setCurrView = function(view){
		$scope.currView = view;
        if(view == "edu"){
            document.getElementById("aboutHeader").style.backgroundColor = "#182036";
            document.getElementById("aboutEdu").style.backgroundColor = "#222c4f";
            document.getElementById("about").style.backgroundColor = "#222c4f";
            document.getElementById("eduHeader").style.opacity = "1";
            document.getElementById("skillsHeader").style.opacity = ".35";
            document.getElementById("expHeader").style.opacity = ".35";
        }else if(view == "skills"){
            document.getElementById("aboutHeader").style.backgroundColor = "#1d494d";
            document.getElementById("aboutSkills").style.backgroundColor = "#266970";
            document.getElementById("about").style.backgroundColor = "#266970";
            document.getElementById("eduHeader").style.opacity = ".35";
            document.getElementById("skillsHeader").style.opacity = "1";
            document.getElementById("expHeader").style.opacity = ".35";
        }else{
            document.getElementById("aboutHeader").style.backgroundColor = "#315261";
            document.getElementById("aboutExperience").style.backgroundColor = "#45768c";
            document.getElementById("about").style.backgroundColor = "#45768c";
            document.getElementById("eduHeader").style.opacity = ".35";
            document.getElementById("skillsHeader").style.opacity = ".35";
            document.getElementById("expHeader").style.opacity = "1";
        }
	}
});

app.controller('game1ctrl', function($scope,$log) {
	alert("Press Start Game to start, and Reset Game to reset. You can customize the game variables as well. First to eight wins! If glitching is seen, reload webpage.");
	
	if($('#deskTop').is(':hidden')){
		document.getElementById('smallGame').innerHTML = "<canvas id=\"mainCan\" width=\"320\" height=\"300\"></canvas>";
	}else{
		document.getElementById('bigGame').innerHTML = "<canvas id=\"mainCan\" width=\"640\" height=\"480\"></canvas>";
	}

	//Paddle var's
	$scope.p1_y = $scope.p2_y = 40	//paddles init y position
	$scope.pt = 10;	//paddle thickness
	$scope.ph = 100;	//paddle height
	$scope.playerSpeed = 20;	//Player speed

	//Ball var's
	$scope.bx = $scope.by = 50; //ball init x and y position
	$scope.bd = 6;	//ball dimensions
	$scope.xv = $scope.yv = 0;	//ball velocity
	var lastSpeed = $scope.xv;

	//Score tracking
	$scope.score1 = $scope.score2 = 0;

	//AI
	$scope.ai_s = 5;

	//To tell if game is in "play" mode
	var activeGame = false;

	//Decide winner
	$scope.winThresh = 8;

	$scope.initGame = function(){	//initialize canvas
		can = document.getElementById('mainCan'); //retrieve canvas element
		canCon = can.getContext('2d');	//retrieve context for graphics drawing buffer
		setInterval(update,30);	//updating screen 30 times/sec
		document.addEventListener('keydown', onKeyDown);
		document.addEventListener('touchmove', touchMove);
		//document.addEventListener('touchstart', touchStart);
	}

	$scope.startGame = function(){
		activeGame = true;
		if(lastSpeed == 0)
			$scope.xv = $scope.yv = 10;
		else
			$scope.xv = $scope.yv = lastSpeed;
	}
	
	//getting keyboard controls
	function onKeyDown(event){	//for when a key is held down
		if(event.keyCode == 38){
			event.preventDefault();
			if($scope.p1_y > 0){	//on key up
				$scope.p1_y -= $scope.playerSpeed;
			}
		}
		if(event.keyCode == 40){	//on key down
			event.preventDefault();
			if($scope.p1_y + $scope.ph < can.height){	
				$scope.p1_y += $scope.playerSpeed;
			}
		}
	}

	function touchMove(e){
		var tSpot = e.targetTouches[0].pageY - $('#mainCan').offset().top - ($scope.ph/2);
		var inCanTop = e.targetTouches[0].pageY - $('#mainCan').offset().top; 
		if(e.targetTouches[0].pageY < $('#mainCan').offset().top){
			//Do nothing
		}else if(e.targetTouches[0].pageY > $('#mainCan').offset().top + can.height){
			//Do nothing
		}else{
			e.preventDefault();
			$scope.p1_y = tSpot;
		}
	}

	$scope.increaseSpeed = function(){
		if(activeGame){
			lastSpeed = $scope.xv;
			if($scope.xv > 0)
				$scope.xv += 1;
			else
				$scope.xv -= 1;
		}
	}

	$scope.decreaseSpeed = function(){
		if(activeGame){
			lastSpeed = $scope.xv;
			if($scope.xv > 0)
				$scope.xv -= 1;
			else
				$scope.xv += 1;
		}
	}

	//For when someone loses/wins
	function reset(){
		$scope.bx = can.width/2;
		$scope.by = can.height/2;
		$scope.xv = -$scope.xv;
		$scope.yv = 3;
	}

	//For user restart
	$scope.restart = function(){
		activeGame = false;
		reset();	//I know lol
		$scope.xv = $scope.yv = 0;	//ball velocity
		$scope.score1 = $scope.score2 = 0;
	}

	function update(){
		//Check for game winner
		if($scope.score1 == $scope.winThresh || $scope.score2 == $scope.winThresh){
			if($scope.score1 == $scope.winThresh){
				alert("Congradulations, you won!");
				$scope.restart();
			}else{
				alert("GAME OVER! Try Again!");
				$scope.restart();
			}
		}
		
		//ball movements
		$scope.bx += $scope.xv;	//update x position
		$scope.by += $scope.yv;	//update y position
		if($scope.by < 0 && $scope.yv < 0){	//ball hits top
			$scope.yv = -$scope.yv; 
		}
		if($scope.by > can.height && $scope.yv > 0){	//ball hits bottom
			$scope.yv = -$scope.yv; 
		}
		if($scope.bx < $scope.pt){ //ball hits left
			if($scope.by > $scope.p1_y && $scope.by < ($scope.p1_y + $scope.ph)){
				$scope.xv = -$scope.xv;
				$scope.dy = $scope.by - ($scope.p1_y + $scope.ph/2);
				$scope.yv = $scope.dy * 0.3;
			}else{
				$scope.score2++;
				reset();
			}
		}	
		if($scope.bx > can.width - $scope.pt - 2){ //ball hits right paddle
			if($scope.by > $scope.p2_y && $scope.by < ($scope.p2_y + $scope.ph)){
				$scope.xv = -$scope.xv;
				$scope.dy = $scope.by - ($scope.p2_y + $scope.ph/2);
				$scope.yv = $scope.dy * 0.3;
			}else{
				$scope.score1++;
				reset();
			}
		}

		//AI movement
		if($scope.p2_y + $scope.ph/2 < $scope.by){	
			//ball above AI
			if($scope.p2_y + $scope.ph < can.height)
				$scope.p2_y += $scope.ai_s;
		}else if($scope.p2_y + $scope.ph/2 == $scope.by){	
			//Do nothing
		}else{
			//ball below AI
			if($scope.p2_y > 0)
				$scope.p2_y -= $scope.ai_s;
		}

		//drawing elements
		canCon.fillStyle="black"; //black out canvas start of each frame
		canCon.fillRect(0,0,can.width,can.height); //fill the whole canvas with black
		canCon.fillStyle="white";
		canCon.fillRect(2,$scope.p1_y,$scope.pt,$scope.ph); 	//paddle 1
		canCon.fillRect(can.width-$scope.pt-2,$scope.p2_y,$scope.pt,$scope.ph);	//paddle 2
		canCon.fillRect($scope.bx,$scope.by,$scope.bd,$scope.bd);	//ball
		

		$scope.$apply();
		
	}
		$scope.$on('$locationChangeStart', function( event ) {
			location.reload();
		});
});
