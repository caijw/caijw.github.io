var $cropBtn = $('.j-crop-btn');
var $container = $('.j-container');
var $origin = $('.j-origin');
var $canvas = null;
var $result = $('.j-result');
var $resultImg = $('.j-result-img');
var imgUrl = 'https://caijw.github.io/asserts/img/Lena.jpg';
// var imgUrl = './asserts/img/Lena.jpg';
var imgUrl = './asserts/img/img1.png';
var imgWidth = 400;
var imgHeight = 225;
var croper = null;

function init() {
	$origin.append(`<canvas id="canvas" width=300 height=300></canvas>`);
	$canvas = $('#canvas');
}

function bind() {
	$cropBtn.on('click', function (evt) {
		croper.crop();
	});
}
var vConsole = new VConsole();
init();
croper = new Cropper({
	canvas: $canvas[0],
	imgUrl: imgUrl,
	canvasLeft: $canvas.offset().left,
	canvasTop: $canvas.offset().top
});
croper.init().then(function (resolve, reject) {
	bind();
}).catch(function (err) {
	console.error(err);
});

