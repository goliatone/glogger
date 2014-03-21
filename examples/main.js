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
	var glogger = new GLogger();
	glogger.init();
});