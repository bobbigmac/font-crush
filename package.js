Package.describe({
  name: 'bobbigmac:font-crush',
  version: '0.1.2',
  summary: 'Encodes any fonts in project to base64 data uris and delivers to the client as CSS.',
  git: 'https://github.com/bobbigmac/font-crush',
  documentation: 'README.md'
});

Package.registerBuildPlugin({
  name: 'compileFontsToCss',
  use: ['base64@1.0.4'],
  sources: ['plugin/font-crush.js']
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.0.2');
  api.use('isobuild:compiler-plugin@1.0.0');

  // api.addFiles('font-crush.js', ['server', 'client']);
});

//TODO: No idea how to test for fonts. Suggestions?
// Package.onTest(function(api) {
//   api.use('ecmascript');
//   api.use('tinytest');
//   api.use('bobbigmac:font-crush');
//   api.addFiles('font-crush-tests.js');
// });
