# Font-crush meteor package

Build-plugin for meteor apps, base64 encodes fonts in the private/fonts folder and delivers to the client as CSS files as part of the application CSS bundle.

## Usage

Place your fonts in any folder. I use `/client/fonts/`. They will not be delivered to the client as font files but each will be squished into a base64 dataUri and compiled into the bundle's normal CSS.

Supported are formats: woff, woff2, otf, ttf, eot, svg and svgz (svg/svgz might be sketchy, test if you need it to work well for those two). 

Provide as many formats for each as you like, matching types for the same font will be consolidated into a single `@font-face`.

*Font names* are determined automatically based on the filename of the font, with underscores used to split for basic metadata in the form `font name_style_#weight`. If you don't include any underscores it will default to normal and try to make a sensible guess of the weight. See [font-crush.js](./plugin/font-crush.js) for defaults.

For example...

```css
/*
	client/fonts/My Font_normal_400.otf
	client/fonts/My Font_bold.otf
	client/fonts/My Font.woff
		gives...
*/

@font-face {
  font-family: My Font;
  font-style: normal;
  font-weight: 400;
  src: 	url(data:application/x-font-opentype;charset=utf-8;base64,H4s...=) format('opentype'), 
				url(data:application/font-woff;charset=utf-8;base64,9Ms...=) format('woff');
}

@font-face {
  font-family: My Font;
  font-style: bold;
  font-weight: 700;
	src: url(data:application/x-font-opentype;charset=utf-8;base64,l9s...=) format('opentype');
}
```

Then assign a `font-family` as normal. 

```css
p.look-awesome {
	font-family: My Font, cursive;
}
```

An array containing the names and styles/weights/types of all loaded fonts will be delivered to the client in a javascript file (if you place your fonts under the client directory) globally as `CrushedFonts` in the form:

```json
// CrushedFonts (global on client)
[
	{
		"name": "My Font",
		"styles": [
			{ "style": "normal", "weight": "400", "types": ["woff", "otf"]},
			{ "style": "bold", "weight": "700", "types": ["otf"]}
		]
	}
]
```

## Warning

Probably not advisable to use a LOT of fonts in a production environment as this package does not cache anything and the CSS file can become quite large as a result. I'm using in a fairly simple project where a half-meg of CSS fonts is no big deal.