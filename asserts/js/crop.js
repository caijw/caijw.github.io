function colorForTouch(touch) {
  var r = touch.identifier % 16;
  var g = Math.floor(touch.identifier / 3) % 16;
  var b = Math.floor(touch.identifier / 7) % 16;
  r = r.toString(16); // make it a hex digit
  g = g.toString(16); // make it a hex digit
  b = b.toString(16); // make it a hex digit
  var color = "#" + r + g + b;
  console.log("color for touch with identifier " + touch.identifier + " = " + color);
  return color;
}

function copyTouch(touch) {
  return { identifier: touch.identifier, pageX: touch.pageX, pageY: touch.pageY };
}

function ongoingTouchIndexById(idToFind) {
  for (var i = 0; i < ongoingTouches.length; i++) {
    var id = ongoingTouches[i].identifier;
    
    if (id == idToFind) {
      return i;
    }
  }
  return -1;    // not found
}

function log(msg) {
	console.log(msg);
}
var ongoingTouches = [];

window.Cropper = function Cropper(opts){
	opts = opts || {};
	this.canvas = opts.canvas;
	this.imgUrl = opts.imgUrl;
	this.imgWidth = opts.imgWidth;
	this.imgHeight = opts.imgHeight;
	this.ongoingTouches = [];
	this.canvas._cropper = this;

	this.canvas.addEventListener("touchstart", this.handleStart, false);
	this.canvas.addEventListener("touchmove", this.handleMove, false);
	this.canvas.addEventListener("touchend", this.handleEnd, false);
	this.canvas.addEventListener("touchcancel", this.handleCancel, false);

};

Cropper.prototype.handleStart = function (evt) {
	var cropper = this._cropper;
	evt.preventDefault();
	console.log("touchstart.");
	var el = document.getElementsByTagName("canvas")[0];
	var ctx = el.getContext("2d");
	var touches = evt.changedTouches;
	      
	for (var i = 0; i < touches.length; i++) {
	  console.log("touchstart:" + i + "...");
	  ongoingTouches.push(copyTouch(touches[i]));
	  var color = colorForTouch(touches[i]);
	  ctx.beginPath();
	  ctx.arc(touches[i].pageX, touches[i].pageY, 4, 0, 2 * Math.PI, false);  // a circle at the start
	  ctx.fillStyle = color;
	  ctx.fill();
	  console.log("touchstart:" + i + ".");
	}
};

Cropper.prototype.handleMove = function (evt) {
	var cropper = this._cropper;
	evt.preventDefault();
	var el = document.getElementsByTagName("canvas")[0];
	var ctx = el.getContext("2d");
	var touches = evt.changedTouches;

	for (var i = 0; i < touches.length; i++) {
	  var color = colorForTouch(touches[i]);
	  var idx = ongoingTouchIndexById(touches[i].identifier);

	  if (idx >= 0) {
	    console.log("continuing touch "+idx);
	    ctx.beginPath();
	    console.log("ctx.moveTo(" + ongoingTouches[idx].pageX + ", " + ongoingTouches[idx].pageY + ");");
	    ctx.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);
	    console.log("ctx.lineTo(" + touches[i].pageX + ", " + touches[i].pageY + ");");
	    ctx.lineTo(touches[i].pageX, touches[i].pageY);
	    ctx.lineWidth = 4;
	    ctx.strokeStyle = color;
	    ctx.stroke();

	    ongoingTouches.splice(idx, 1, copyTouch(touches[i]));  // swap in the new touch record
	    console.log(".");
	  } else {
	    console.log("can't figure out which touch to continue");
	  }
	}
};

Cropper.prototype.touchend = function (evt) {
	var cropper = this._cropper;
	evt.preventDefault();
	log("touchend");
	var el = document.getElementsByTagName("canvas")[0];
	var ctx = el.getContext("2d");
	var touches = evt.changedTouches;

	for (var i = 0; i < touches.length; i++) {
	  var color = colorForTouch(touches[i]);
	  var idx = ongoingTouchIndexById(touches[i].identifier);

	  if (idx >= 0) {
	    ctx.lineWidth = 4;
	    ctx.fillStyle = color;
	    ctx.beginPath();
	    ctx.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);
	    ctx.lineTo(touches[i].pageX, touches[i].pageY);
	    ctx.fillRect(touches[i].pageX - 4, touches[i].pageY - 4, 8, 8);  // and a square at the end
	    ongoingTouches.splice(idx, 1);  // remove it; we're done
	  } else {
	    console.log("can't figure out which touch to end");
	  }
	}
};

Cropper.prototype.handleCancel = function (evt) {
	var cropper = this._cropper;
	evt.preventDefault();
	console.log("touchcancel.");
	var touches = evt.changedTouches;
	
	for (var i = 0; i < touches.length; i++) {
	  var idx = ongoingTouchIndexById(touches[i].identifier);
	  ongoingTouches.splice(idx, 1);  // remove it; we're done
	}
};



Cropper.prototype.crop = function () {
	
};