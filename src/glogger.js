/*
 * glogger
 * https://github.com/goliatone/glogger
 * Created with gbase.
 * Copyright (c) 2014 goliatone
 * Licensed under the MIT license.
 */
/* jshint strict: false, plusplus: true */
/*global define: false, require: false, module: false, exports: false */
(function (root, name, deps, factory) {
    'use strict';
    // Node
    if(typeof deps === 'function') {
        factory = deps;
        deps = [];
    }

    if (typeof exports === 'object') {
        module.exports = factory.apply(root, deps.map(require));
    } else if (typeof define === 'function' && 'amd' in define) {
        //require js, here we assume the file is named as the lower
        //case module name.
        define(name.toLowerCase(), deps, factory);
    } else {
        // Browser
        var d, i = 0, global = root, old = global[name], mod;
        while((d = deps[i]) !== undefined) deps[i++] = root[d];
        global[name] = mod = factory.apply(global, deps);
        //Export no 'conflict module', aliases the module.
        mod.noConflict = function(){
            global[name] = old;
            return mod;
        };
    }
}(this, 'glogger', ['jquery'], function($) {

    var _getName = function(owner){
        if(owner.name) return owner.name;
        if(owner.__name__) return owner.__name__;
        if(owner.constructor){
            var match = owner.constructor.toString().match(/function ([^\(]+)/);
            if(match) return match[1];
            return '';
        }
        return '';
    };

    var _get = function(object, key, def){
        if(!object) return def;
        if(!object.hasOwnProperty(key)) return def;
        if(typeof object[key] === 'function') return object[key].call(object);
        return object[key];
    };

    var _set = function(object, key, value){
        if(!object) return;
        if(!object.hasOwnProperty(key)) return;
        if(typeof object[key] === 'function') object[key].call(object, key);
        object[key] = value;
    };

    var _getDate = function getDate() {
        var date = new Date();

        var hour = date.getHours();
        hour = (hour < 10 ? '0' : '') + hour;

        var min  = date.getMinutes();
        min = (min < 10 ? '0' : '') + min;

        var sec = date.getSeconds();
        sec = (sec < 10 ? '0' : '') + sec;

        return hour + ':' + min + ':' + sec;
    };

///////////////////////////////////////////////////
// CONSTRUCTOR
///////////////////////////////////////////////////
    var console = window.console || {};


    /**
     * GLogger constructor
     *
     * @param  {object} config Configuration object.
     */
    var GLogger = function GLogger(name) {
        this.setName(name || 'RootLogger');

        this.enabled(true);

        this.filters = GLogger.DEFAULT_FILTERS.concat();

        return this;
    };

///////////////////////////////////////////////////
// METHODS
///////////////////////////////////////////////////

    /**
     * Adds an appender to the available appenders.
     * @param {String} id       Appender id.
     * @param {Object} appender
     */
    GLogger.addAppender = function(id, appender){
        this.APPENDERS[id] = appender;
    };

    /**
     * Make logger active effectively making other
     * loggers go mute.
     * @param  {GLogger} logger GLogger
     */
    GLogger.makeActive = function(logger){
        if(!logger) return delete this.activeLogger;
        this.activeLogger = 'logger' in logger ? logger.logger : logger;
    };

    /**
     * Factory method. Creates a new instance of GLogger.
     * @param  {Object} owner   Object to which a logger
     *                          intance will be attached
     * @param  {Object} options Options object passed to
     *                          GLogger instance
     */
    GLogger.instance = function(owner, options){
        if(typeof owner === 'function') owner = owner.prototype;
        options || (options = {name:_getName(owner)});

        owner.logger = new GLogger(options.name);
        var value;
        Object.keys(options).forEach(function(key){
            value = _get(options, key);
            _set(owner.GLogger, key, value);
        });
    };

    GLogger.FORCE = ['error'];

    //TODO: This might not be the best idea...
    GLogger.INSTANCES = {};

    GLogger.DEFAULT_FILTERS = [
        //Filters out disabled loggers, except when the level is found in FORCE
        function(level){return !this._enabled && GLogger.FORCE.indexOf(level) === -1;},
        //If we have an active logger, and it's not this logger, filter out.
        function(level){return GLogger.activeLogger && GLogger.activeLogger !== this;}
    ];

    GLogger.APPENDERS = {'console':console};

    GLogger.LOG_METHODS = ['debug', 'log', 'info', 'warn', 'error'];

    GLogger.PASSTHROUG_METHODS = [
        'assert','clear', 'count', 'dir', 'dirxml',
        'exception', 'group', 'groupCollapsed', 'groupEnd',
        'markTimeline', 'profile', 'profileEnd', 'table',
        'time', 'timeEnd', 'timeStamp', 'trace', 'memory', 'profiles'
    ];

    GLogger.prototype.enabled = function(enabled) {
        if(enabled === undefined) return this._enabled;
        this._enabled = !!enabled;
        return this._enabled;
    };

    GLogger.prototype.setName = function(name){
        if(this.name) GLogger.INSTANCES[this.name] = null;
        this.name = name;
        GLogger.INSTANCES[name] = this;
        return this;
    };

    GLogger.prototype.getHeader = function(level, append){
        return [_getDate(),' ','[',level.toUpperCase(),']\t', this.name,':',' ', append || ''].join('');
    };

    GLogger.prototype.addFilter = function(filter){
        this.filters.push(filter);
    };

    GLogger.prototype.applyFilters = function(level){
        var filter;
        for(var i=0; i < this.filters.length;++i){
            if(this.filters[i].call(this,level)) return true;
        }
        return false;
    };


    var bind = Function.prototype.bind && typeof console === "object";

    GLogger.LOG_METHODS.forEach(function(method){
            if(bind){
                // Make the method an actual function
                // (IE's console.log is not actually a Function and therefore has no apply())
                console[method] = Function.prototype.call.bind(console[method], console);
            }

            GLogger.prototype[method] = function(){

                if(this.applyFilters(method)) return;

                console[method] || (method = 'log');

                var args = Array.prototype.slice.call(arguments);

                //We want to keep string interpolation, don't we?
                if(typeof args[0] === 'string') args[0] = this.getHeader(method, args[0]);
                else args.unshift(this.getHeader(method));

                var appender;
                Object.keys(GLogger.APPENDERS).forEach(function(id){
                    appender = GLogger.APPENDERS[id];
                    if(typeof appender[method] !== 'function') return;
                    appender[method].apply(appender, args);
                });
            };
      },this);


    return GLogger;
}));
