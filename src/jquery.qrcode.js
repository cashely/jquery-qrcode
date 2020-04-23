(function( $ ){

	// 文字转换为utf-8
	function toUtf8(str) {
			var out, i, len, c;
			out = "";
			len = str.length;
			for (i = 0; i < len; i++) {
					c = str.charCodeAt(i);
					if ((c >= 0x0001) && (c <= 0x007F)) {
							out += str.charAt(i);
					} else if (c > 0x07FF) {
							out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
							out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
							out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
					} else {
							out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
							out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
					}
			}
			return out;
	}
	$.fn.qrcode = function(options) {
		// if options is string,
		if( typeof options === 'string' ){
			options	= { text: options };
		}

		// set default values
		// typeNumber < 1 for automatic calculation
		options	= $.extend( {}, {
			render		: "canvas",
			width		: 256,
			height		: 256,
			imgWidth: 60,
			imgHeight: 60,
			typeNumber	: -1,
			correctLevel	: QRErrorCorrectLevel.H,
                        background      : "#ffffff",
                        foreground      : "#000000"
		}, options);
		options.text = toUtf8(options.text);
		var createCanvas	= function(){
			// create the qrcode itself
			var qrcode	= new QRCode(options.typeNumber, options.correctLevel);
			qrcode.addData(options.text);
			qrcode.make();

			// create canvas element
			var canvas	= document.createElement('canvas');
			canvas.width	= options.width;
			canvas.height	= options.height;
			var ctx		= canvas.getContext('2d');
			ctx.fillStyle = '#fff'
			ctx.fillRect(0, 0, options.width, options.height)

			var img = new Image();
			img.src = options.src;
			//不放在onload里，图片出不来
			img.onload = function () {
				ctx.fillRect((options.width - options.imgWidth - 10) / 2, (options.height - options.imgHeight - 10) / 2, options.imgWidth + 10 , options.imgHeight + 10);
				ctx.drawImage(img, (options.width - options.imgWidth) / 2, (options.height - options.imgHeight) / 2, options.imgWidth, options.imgHeight);
			}


			// compute tileW/tileH based on options.width/options.height
			var tileW	= (options.width - 20)  / qrcode.getModuleCount();
			var tileH	= (options.height - 20) / qrcode.getModuleCount();

			// draw in the canvas
			for( var row = 0; row < qrcode.getModuleCount(); row++ ){
				for( var col = 0; col < qrcode.getModuleCount(); col++ ){
					ctx.fillStyle = qrcode.isDark(row, col) ? options.foreground : options.background;
					var w = (Math.ceil((col+1)*tileW) - Math.floor(col*tileW));
					var h = (Math.ceil((row+1)*tileH) - Math.floor(row*tileH));
					ctx.fillRect(Math.round(col*tileW) + 10,Math.round(row*tileH) + 10, w, h);
				}
			}



			return canvas


		}

		// from Jon-Carlos Rivera (https://github.com/imbcmdth)
		var createTable	= function(){
			// create the qrcode itself
			var qrcode	= new QRCode(options.typeNumber, options.correctLevel);
			qrcode.addData(options.text);
			qrcode.make();

			// create table element
			var $table	= $('<div style="padding: 10px"><table></table></div>')
				.css("width", options.width+"px")
				.css("height", options.height+"px")
				.css("border", "0px")
				.css("border-collapse", "collapse")
				.css('background-color', options.background);

			// compute tileS percentage
			var tileW	= options.width / qrcode.getModuleCount();
			var tileH	= options.height / qrcode.getModuleCount();

			// draw in the table
			for(var row = 0; row < qrcode.getModuleCount(); row++ ){
				var $row = $('<tr></tr>').css('height', tileH+"px").appendTo($table);

				for(var col = 0; col < qrcode.getModuleCount(); col++ ){
					$('<td></td>')
						.css('width', tileW+"px")
						.css('background-color', qrcode.isDark(row, col) ? options.foreground : options.background)
						.appendTo($row);
				}
			}
			// return just built canvas
			return $table;
		}


		return this.each(function(){
			var element	= options.render == "canvas" ? createCanvas() : createTable();
			$(element).appendTo(this);
		});
	};
})( jQuery );
