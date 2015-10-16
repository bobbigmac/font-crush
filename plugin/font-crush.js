
Plugin.registerCompiler({
  extensions: ['woff', 'woff2', 'otf', 'ttf', 'eot', 'svg', 'svgz']
}, function() {
	return new FontCompiler();
});

var mimetypes = {
	'ttf': "application/x-font-ttf",
	'otf': "application/x-font-opentype",
	'woff': "application/font-woff",
	'woff2': "application/font-woff2",
	'eot': "application/vnd.ms-fontobject",
	'svg': "image/svg+xml",
	'svgz': "image/svg+xml"
};

var formats = {
	'ttf': 'truetype',
	'otf': 'opentype',
	'woff': 'woff',
	'woff2': 'woff2',
	'eot': 'embedded-opentype',
	'svg': 'svg',
	'svgz': 'svgz'
};

var weights = {
	'thin': 100,
	'extralight': 200,
	'ultralight': 200,
	'light': 300,
	'normal': 400,
	'medium': 500,
	'semibold': 600,
	'demibold': 600,
	'bold': 700,
	'extrabold': 800,
	'ultrabold': 800,
	'black': 900,
	'heavy': 900
};

var fontFileToObj = function(fileName, base64) {
	var fontObj = {};

	var dotParts = fileName.split('.');
	fontObj.extension = dotParts[dotParts.length-1];
	fontObj.slug = dotParts.slice(0, dotParts.length-1).join('.');

	var params = fontObj.slug.split('_');
	fontObj.name = params[0] || 'Unknown-font';
	fontObj.style = params[1] || 'normal';
	fontObj.weight = params[2] || (fontObj.style && weights[fontObj.style]) || '400';

	fontObj.data = base64;

	return fontObj;
};

var fontsToData = function(fontsObj) {
	var output = [];
	if(fontsObj) {
		var namedFonts = {};
		
		Object.keys(fontsObj).map(function(fontName) {
			if(fontsObj[fontName] && fontsObj[fontName].length) {

				fontsObj[fontName].forEach(function(detail) {
					namedFonts[detail.name] = namedFonts[detail.name] || {};
					namedFonts[detail.name][detail.style+'_'+detail.weight] = namedFonts[detail.name][detail.style+'_'+detail.weight] || [];
					namedFonts[detail.name][detail.style+'_'+detail.weight].push(detail.extension);
				});
			}
		});

		var output = Object.keys(namedFonts).map(function(fontName) {
			return {
				name: fontName,
				styles: Object.keys(namedFonts[fontName]).map(function(fontStyle) {
					var extensions = namedFonts[fontName][fontStyle];
					var style = fontStyle.split('_');
					if(style && style.length == 2) {
						return {
							style: style[0],
							weight: style[1],
							types: extensions
						};
					}
				}).filter(function(o) { return !!o; })
			};
		});
	}
	return output;
};

var fontsToCss = function(fontsObj) {
	var output = [];
	if(fontsObj) {
		Object.keys(fontsObj).forEach(function(fontName) {
			if(fontsObj[fontName] && fontsObj[fontName].length) {

				var first = fontsObj[fontName][0];

				output.push("@font-face {");
				output.push("\tfont-family: " + first.name + ";");
				output.push("\tfont-style: " + first.style + ";");
				output.push("\tfont-weight: " + first.weight + ";");
				
				var srcs = fontsObj[fontName].map(function(detail) {
					return "url(data:" + mimetypes[detail.extension] + ";" +
						"charset=utf-8;base64," + detail.data + ") " +
						"format('" + formats[detail.extension]+"')";
				});
				
				output = output.concat("\tsrc: " + srcs.join(", \n\t"));
				
				output.push("}");
			}
		});
	}
	return output.join("\n");
};

var FontCompiler = function () {
};

FontCompiler.prototype.processFilesForTarget = function (inputFiles) {
	var fonts = {};
	var outputFilename = "fonts_" + (new Date()).getTime() + ".css";

	inputFiles.forEach(function(inputFile, pos) {

		var fileName = inputFile.getBasename();
		var pathName = inputFile.getPathInPackage();

		var fileContents = inputFile.getContentsAsBuffer();
		var base64 = Base64.encode(fileContents);

		var fontObj = fontFileToObj(fileName, base64);
		if(fontObj && fontObj.name) {
			fonts[fontObj.slug] = fonts[fontObj.slug] || [];
			fonts[fontObj.slug].push(fontObj);
		}

		//when on last font, build css output
		if(pos === (inputFiles.length - 1)) {
			inputFile.addStylesheet({
				data: fontsToCss(fonts),
				path: outputFilename
			});

			var fontsData = fontsToData(fonts);
			var fontsJson = JSON.stringify(fontsData);

			// Add a javascript file to tell the client which fonts were loaded.
			inputFile.addJavaScript({
				data: 'CrushedFonts = '+fontsJson+';',
				path: 'crushed-fonts.js'
			});

			// Add an asset of loaded fonts (probably redundant but maybe useful to someone)
			inputFile.addAsset({
				data: fontsJson,
				path: 'crushed-fonts.json'
			});

			// Adding javascript and assets seems to determine their server/client availability
			// 	from the parent folder. So... if you want your fonts available only on the 
			// 	server (though I can't imagine why) then place them in a folder such as /server/fonts.
			// 	Typically you would want to use /client/fonts to deliver the css, and the javascript
			// 	to the client.
		}
	});
};