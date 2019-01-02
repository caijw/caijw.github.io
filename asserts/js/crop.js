function colorForTouch(touch) {
	var r = touch.identifier % 16;
	var g = Math.floor(touch.identifier / 3) % 16;
	var b = Math.floor(touch.identifier / 7) % 16;
	r = r.toString(16); // make it a hex digit
	g = g.toString(16); // make it a hex digit
	b = b.toString(16); // make it a hex digit
	var color = "#" + r + g + b;
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
	that.canvasTop = opts.canvasTop || 0;
	that.canvasLeft = opts.canvasLeft || 0;
};

Cropper.prototype.init = function(opts) {
	var that = this;
	return new Promise(function(resolve, reject) {
		opts = opts || {};
		that.canvas = opts.canvas || that.canvas || null;
		that.imgUrl = opts.imgUrl || that.imgUrl || null;
		that.canvasWidth = that.canvas.width || 0;
		that.canvasHeight = that.canvas.height || 0;
		if(opts.canvas){
			that.canvasTop = opts.canvasTop || 0;
			that.canvasLeft = opts.canvasLeft || 0;
		}

		that.ongoingTouches = [];
		that.originX = 0;
		that.originY = 0;
		that.curOriginX = 0;
		that.curOriginY = 0;
		that.startX = 0;
		that.startY = 0;

		if (!that.canvas) {
			reject('no canvas');
			return;
		}
		var img = new Image();
		img.onload = function() {
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
		img.onerror = function(err) {
			reject(err);
		};
		img.src = that.imgUrl;
	});
};

/*
	clear
*/
Cropper.prototype.uninit = function() {
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
	return {
		identifier: touch.identifier,
		pageX: touch.pageX,
		pageY: touch.pageY
	};
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
	console.log("handleStart trigger");
	var el = cropper.canvas;
	var ctx = el.getContext("2d");
	var touches = evt.changedTouches;

	for (var i = 0; i < touches.length; i++) {
		if (cropper.ongoingTouchIndexById(touches[i].identifier) === -1) {
			cropper.ongoingTouches.push(cropper.copyTouch(touches[i]));

		}
	}
};

Cropper.prototype.handleMove = function(evt) {

	evt.preventDefault();
	var cropper = this._cropper;
	console.log("handleMove trigger");
	var canvas = cropper.canvas;
	var ctx = canvas.getContext("2d");
	var touches = evt.changedTouches;

	console.log('handleMove, touch num:', touches.length);
	if(touches.length == 1 && cropper.ongoingTouches.length == 1){

		console.log('handleMove, move');
		/*move*/
		var pageX = 0, pageY = 0;
		for(var i = 0; i < touches.length; ++i){
			console.log('touch:' + i + ' ,identifier: ' + touches[i].identifier);
			pageX += touches[i].pageX;
			pageY += touches[i].pageY;
		}

		var curMidPoint = {
			pageX: pageX / touches.length,
			pageY: pageY / touches.length
		}
		pageX = 0;
		pageY = 0;
		// for(var i = 0; i < cropper.ongoingTouches.length; ++i){
		// 	pageX += cropper.ongoingTouches[i].pageX;
		// 	pageY += cropper.ongoingTouches[i].pageY;
		// }

		var idx = cropper.ongoingTouchIndexById(touches[0].identifier);
		if(idx >= 0){
			pageX += cropper.ongoingTouches[idx].pageX;
			pageY += cropper.ongoingTouches[idx].pageY;
		}else{
			return;
		}

		var preMidPoint = {
			pageX: pageX / touches.length,
			pageY: pageY / touches.length
		}
		var deltaX = curMidPoint.pageX - preMidPoint.pageX;
		var deltaY = curMidPoint.pageY - preMidPoint.pageY;
		ctx.clearRect(cropper.startX, cropper.startY, cropper.imgWidth, cropper.imgHeight);
		ctx.translate(deltaX, deltaY);
		ctx.drawImage(
			cropper.img,
			0, 0,
			cropper.imgWidth, cropper.imgHeight,
			cropper.startX, cropper.startY,
			cropper.imgWidth, cropper.imgHeight
		);
		cropper.originX = cropper.originX + deltaX;
		cropper.originY = cropper.originY + deltaY;
		console.log('deltaX:', deltaX, 'deltaY:', deltaY);
		console.log('cropper.originX:', cropper.originX, 'cropper.originY:', cropper.originY);


	}else if(touches.length == 2 && cropper.ongoingTouches.length == 2){
		console.log('handleMove, scale');

		for(var i = 0; i < touches.length; ++i){
			console.log('touch:' + i + ' ,identifier: ' + touches[i].identifier);
		}

		/*scale*/
		var curTouchA = touches[0];
		var curTouchB = touches[1];
		var idxA = cropper.ongoingTouchIndexById(curTouchA.identifier);
		var idxB = cropper.ongoingTouchIndexById(curTouchB.identifier);
		if(idxA >= 0 && idxB >= 0){
			var preTouchA = cropper.ongoingTouches[idxA];
			var preTouchB = cropper.ongoingTouches[idxB];
			var curDistance = Math.pow(Math.pow(curTouchA.pageX - curTouchB.pageX, 2) +  Math.pow(curTouchA.pageY - curTouchB.pageY, 2), 0.5); 
			var preDistance = Math.pow(Math.pow(preTouchA.pageX - preTouchB.pageX, 2) +  Math.pow(preTouchA.pageY - preTouchB.pageY, 2), 0.5); 
			var scale = curDistance / preDistance;
			/*需要相对cancas左上角的坐标*/
			var curMidTouch = {
				x: (curTouchA.pageX + curTouchB.pageX) / 2 - cropper.canvasLeft,
				y: (curTouchA.pageY + curTouchB.pageY) / 2 - cropper.canvasTop
			};
			var translateDeltaX = curMidTouch.x - cropper.originX;
			var translateDeltaY = curMidTouch.y - cropper.originY;
			console.log('curMidTouch:', curMidTouch);
			console.log('scale:', scale);
			console.log('canvasLeft:', cropper.canvasLeft, 'canvasTop:', cropper.canvasTop);
			console.log('originX:', cropper.originX, 'originY:', cropper.originY);
			console.log('translateDeltaX:', translateDeltaX, 'translateDeltaY:', translateDeltaY);
			ctx.clearRect(cropper.startX, cropper.startY, cropper.imgWidth, cropper.imgHeight);
			ctx.translate(translateDeltaX, translateDeltaY);
			ctx.scale(scale, scale);
			ctx.drawImage(
				cropper.img,
				0, 0,
				cropper.imgWidth, cropper.imgHeight,
				-curMidTouch.x, -curMidTouch.y,
				cropper.imgWidth, cropper.imgHeight
			);
			ctx.translate(-translateDeltaX, -translateDeltaY);

		}

	}


	// ctx.clearRect(0, 0, cropper.imgWidth, cropper.imgHeight);
	// // ctx.save();
	// ctx.translate(50, 50);
	// ctx.scale(1.1, 1.1);
	// ctx.drawImage(
	// 	cropper.img,
	// 	0, 0,
	// 	cropper.imgWidth, cropper.imgHeight,
	// 	-50, -50,
	// 	cropper.imgWidth, cropper.imgHeight
	// );
	// ctx.translate(-50, -50);
	// ctx.restore();

	for(var i = 0; i < touches.length; ++i){
		var idx = cropper.ongoingTouchIndexById(touches[i].identifier);
		if(idx >= 0){
			cropper.ongoingTouches.splice(idx, 1, cropper.copyTouch(touches[i]));
		}
	}

	return;
};

Cropper.prototype.handleEnd = function(evt) {

	console.log('handleEnd trigger')
	evt.preventDefault();
	var cropper = this._cropper;
	var el = cropper.canvas;
	var ctx = el.getContext("2d");
	var touches = evt.changedTouches;

	for (var i = 0; i < touches.length; i++) {
		var color = colorForTouch(touches[i]);
		var idx = cropper.ongoingTouchIndexById(touches[i].identifier);

		if (idx >= 0) {
			cropper.ongoingTouches.splice(idx, 1); // remove it; we're done
		} else {
			console.log("can't figure out which touch to end");
		}
	}
};

Cropper.prototype.handleCancel = function(evt) {

	evt.preventDefault();
	var cropper = this._cropper;
	console.log("handleCancel trigger");
	var touches = evt.changedTouches;

	for (var i = 0; i < touches.length; i++) {
		var idx = cropper.ongoingTouchIndexById(touches[i].identifier);
		cropper.ongoingTouches.splice(idx, 1); // remove it; we're done
	}
};



Cropper.prototype.crop = function() {

};