/*global define:true requirejs:true*/
/* jshint strict: false */
requirejs.config({
    paths: {
        'jquery': 'jquery/jquery',
        'glogger': 'glogger'
    }
});

define(['glogger', 'jquery'], function (GLogger, $) {
    console.log('Loading');
    var logger = new GLogger('Main');
	var glogger = new GLogger('GLogger');
    window.l = logger;
	window.g = glogger;
    window.GLogger = GLogger;
});