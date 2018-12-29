var $cropBtn = $('.j-crop-btn');
var $container = $('.j-container');
var $origin = $('.j-origin');
var $canvas = null;
var $result = $('.j-result');
var $resultImg = $('.j-result-img');
var imgUrl = 'https://caijw.github.io/asserts/img/Lena.jpg';
var imgUrl = './asserts/img/Lena.jpg';
var imgWidth = 400;
var imgHeight = 225;
function init() {
	return new Promise(function (resolve, reject) {
		$origin.append(`<canvas id="canvas" width=300 height=300></canvas>`);
		$canvas = $('#canvas');
		var img = new Image(); 
		img.onload = function(){
			var ctx = $canvas[0].getContext('2d');
			// ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
			resolve();
		};
		img.onerror = function(err){
			reject(err);
		};
		img.src = imgUrl;
	});
}

function bind() {
	
}
var vConsole = new VConsole();
init().then(function () {
	var croper = new Cropper({
		canvas: $canvas[0]
	});
}).catch(function (err) {
	alert('初始化失败');
	console.error(err);
})
