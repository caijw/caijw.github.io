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



function log(msg) {
    console.log(msg);
}

window.Cropper = function Cropper(opts) {
	var that = this;
    opts = opts || {};
    that.canvas = opts.canvas || null;
    that.imgUrl = opts.imgUrl || null;
};

Cropper.prototype.init = function (opts) {
	var that = this;
	return new Promise(function (resolve, reject) {
		opts = opts || {};
		that.canvas = opts.canvas || that.canvas || null;
		that.imgUrl = opts.imgUrl || that.imgUrl || null;
		that.canvasWidth = that.canvas.width || 0;
		that.canvasHeight = that.canvas.height || 0;
		that.ongoingTouches = [];
		that.originX = 0;
		that.originY = 0;
		that.curOriginX = 0;
		that.curOriginY = 0;

		if(!that.canvas){
			reject('no canvas');
			return;
		}
		var img = new Image(); 	
		img.onload = function(){
			that.canvas._cropper = that;
			that.img = img;
			that.imgWidth = img.width;
			that.imgHeight = img.height;

			that.canvas.addEventListener("touchstart", that.handleStart, false);
			that.canvas.addEventListener("touchmove", that.handleMove, false);
			that.canvas.addEventListener("touchend", that.handleEnd, false);
			that.canvas.addEventListener("touchcancel", that.handleCancel, false);

			var ctx = that.canvas.getContext('2d');
			ctx.drawImage(
				that.img,
				0, 0,
				that.imgWidth, that.imgHeight,
				0, 0,
				that.imgWidth, that.imgHeight
			);

			resolve();
		};
		img.onerror = function(err){
			reject(err);
		};
		img.src = that.imgUrl;
	});
};

/*
	clear
*/
Cropper.prototype.uninit = function () {
	var that = this;
	that.canvas.removeEventListener("touchcancel", that.handleCancel);
	that.canvas.removeEventListener("touchend", that.handleEnd);
	that.canvas.removeEventListener("touchmove", that.handleMove);
	that.canvas.removeEventListener("touchstart", that.handleStart);
	that.imgHeight = 0;
	that.imgWidth = 0;
	that.img = null;
	that.canvas._cropper = null;
	that.ongoingTouches = [];
	that.imgUrl = '';
	that.canvas = null;
};

Cropper.prototype.copyTouch = function(touch) {
    return { identifier: touch.identifier, pageX: touch.pageX, pageY: touch.pageY };
}

Cropper.prototype.ongoingTouchIndexById = function(idToFind) {
    for (var i = 0; i < this.ongoingTouches.length; i++) {
        var id = this.ongoingTouches[i].identifier;

        if (id == idToFind) {
            return i;
        }
    }
    return -1;
}

Cropper.prototype.handleStart = function(evt) {

    evt.preventDefault();
    var cropper = this._cropper;
    console.log("touchstart.");
    var el = cropper.canvas;
    var ctx = el.getContext("2d");
    var touches = evt.changedTouches;

    for (var i = 0; i < touches.length; i++) {
        console.log("touchstart:" + i + "...");
        if (cropper.ongoingTouchIndexById(touches[i].identifier) === -1) {
        	cropper.ongoingTouches.push(cropper.copyTouch(touches[i]));
        	console.log("touchstart:" + i + ".");
        }
    }
};

Cropper.prototype.handleMove = function(evt) {

    evt.preventDefault();
    var cropper = this._cropper;
    var canvas = cropper.canvas;
    var ctx = canvas.getContext("2d");
    var touches = evt.changedTouches;

    for (var i = 0; i < touches.length; i++) {
        var color = colorForTouch(touches[i]);
        var idx = cropper.ongoingTouchIndexById(touches[i].identifier);
        if (idx >= 0) {

            var ongoingTouche = cropper.ongoingTouches[idx];
            var touch = touches[i];
            var deltaX = touch.pageX - ongoingTouche.pageX;
            var deltaY = touch.pageY - ongoingTouche.pageY;

            console.log('clearRect');
            ctx.clearRect(0, 0, cropper.imgWidth, cropper.imgHeight);
            console.log('clearRect done');

            console.log('drawImage');
            console.log(cropper.originX, cropper.originX);
            console.log(deltaX, deltaY);
            console.log(cropper.originX + deltaX, cropper.originX + deltaY);
            ctx.translate(cropper.originX + deltaX, cropper.originX + deltaY);
            // cropper.curOriginX = cropper.originX + deltaX;
            // cropper.curOriginY = cropper.originY + deltaY;
            ctx.drawImage(
            	cropper.img,
            	0, 0,
            	cropper.imgWidth, cropper.imgHeight,
            	0, 0,
            	cropper.imgWidth, cropper.imgHeight
            );
            console.log('drawImage done');
            cropper.ongoingTouches.splice(idx, 1, cropper.copyTouch(touches[i])); // swap in the new touch record

        } else {
            console.log("can't figure out which touch to continue");
        }
    }
};

Cropper.prototype.touchend = function(evt) {
	debugger
	console.log('touchend trigger')
    evt.preventDefault();
    var cropper = this._cropper;
    var el = cropper.canvas;
    var ctx = el.getContext("2d");
    var touches = evt.changedTouches;

    for (var i = 0; i < touches.length; i++) {
        var color = colorForTouch(touches[i]);
        var idx = cropper.ongoingTouchIndexById(touches[i].identifier);

        if (idx >= 0) {
        	console.log('find end touch')
            cropper.ongoingTouches.splice(idx, 1); // remove it; we're done
            if(cropper.ongoingTouches.length === 0){
            	// cropper.originX = 0;
            	// cropper.originY = 0;
            }
        } else {
            console.log("can't figure out which touch to end");
        }
    }
};

Cropper.prototype.handleCancel = function(evt) {
	
    evt.preventDefault();
    var cropper = this._cropper;
    console.log("touchcancel.");
    var touches = evt.changedTouches;

    for (var i = 0; i < touches.length; i++) {
        var idx = cropper.ongoingTouchIndexById(touches[i].identifier);
        cropper.ongoingTouches.splice(idx, 1); // remove it; we're done
    }
};



Cropper.prototype.crop = function() {

};