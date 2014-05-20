/*
 * manuscript
 * http://github.com/typesettin/manuscript
 *
 * Copyright (c) 2014 Yaw Joseph Etse. All rights reserved.
 */

'use strict';

var classie = require('classie'),
	extend = require('util-extend'),
	events = require('events'),
	domhelper = require('domhelper'),
	util = require('util');

/**
 * A module that represents a platter.
 * @{@link https://github.com/typesettin/platter}
 * @author Yaw Joseph Etse
 * @copyright Copyright (c) 2014 Typesettin. All rights reserved.
 * @license MIT
 * @module manuscript
 * @requires module:classie
 * @requires module:util-extent
 * @requires module:util
 * @requires module:domhelper
 * @requires module:events
 * @todo to do later
 */
var platter = function(config_options){
	/** module default configuration */
	var options,
		defaults = {
			idSelector : 'platter',
			name : null,
			title : null,
			fullIdSelector: null,
			platterContentElement: null,
			notifications: 0,
			windowObjectReference: null,
			element: null
		},
		container;

	//extend default options
	options = extend( defaults,config_options );


	/** The current scroll delay setting */
	this.config = function(){
		return options;
	};

	/** 
	 * The element to clone in child window
	 * @param {object} element - html element to clone
	 */
	this.setPlatterContentElement = function(element){
		options.platterContentElement = element;
	};

	/** makes sure create unique dom elements */
	this.isSelectorUnique = function(){
		if(document.querySelector('#'+options.idSelector+'_pltr') === null){
			options.fullIdSelector = options.idSelector+'_pltr';
			options.name = options.idSelector;
			options.title = (options.title) ? options.title : options.name;
			return true;
		}
		else{
			return false;
		}
	};

	/**
	 * intialize a new platter
	 */
	this.init = function(){
		if(this.isSelectorUnique() === false){
			throw new Error('idSelector must be unique');
		}
		else{
			if(document.querySelector('#_pltrContainer')){
				this.createPlatter(options.fullIdSelector);
			}
			else{
				this.createContainer();
				this.createPlatter(options.fullIdSelector);
			}
			options.element = document.getElementById(options.fullIdSelector);
			options.element.addEventListener('click',platterClickEventHandler);
			this.emit("intializedPlatter",true);
		}
	}.bind(this);

	/**
	 * create platter html container
	 */
	this.createContainer = function(){
		var platterContainer = document.createElement('div');
		platterContainer.setAttribute("id","_pltrContainer");
		classie.addClass(platterContainer,'_pltr-bottom');
		document.body.appendChild(platterContainer);
	};

	/**
	 * create platter html
	 * @param {string} id name for platter selector id
	 */
	this.createPlatter = function(id){
		var platterHTML = document.createElement('div');
		platterHTML.setAttribute('id',id);
		classie.addClass(platterHTML,'_pltr-tab');
		classie.addClass(platterHTML,'_pltr-item');
		platterHTML.innerHTML =options.title+'<span class="_pltr-open-window">[]</span>';
		document.querySelector('#_pltrContainer').appendChild(platterHTML);
	};

	/** hides platter in bar */
	this.hidePlatterTab = function(){
		domhelper.elementHideCss(document.getElementById(options.fullIdSelector));
	};

	/** show platter in bar */
	this.showPlatterTab = function(){
		domhelper.elementShowCss(document.getElementById(options.fullIdSelector));
	};

	/**
	 * opens platter in new window
	 * @throws {ERROR} If cannot open new window
	 * @fires eventEmitter event for opened window
	 */
	this.open = function(link,callback){
		var strWindowFeatures = "menubar=no, location=no, resizable=yes,scrollbars=yes, status=yes, dependent=yes, alwaysRaised=yes ",
			linkurl = (link) ? link : 'assets/platter.html';

		options.windowObjectReference = window.open('', options.name, strWindowFeatures);
		options.windowObjectReference.document.write('working: '+options.name);
		options.windowObjectReference.document.title = options.title;

		options.windowObjectReference.addEventListener('unload',closePlatterWindowEventHandler,false);
		options.windowObjectReference.addEventListener('click',this.childPlatterWindowClickEventHandler,false);
		callCallBack(callback);
	}.bind(this);

	var platterClickEventHandler = function(e){
		var etarget = e.target;
		if(classie.hasClass(etarget,'_pltr-open-window')){
			if(options.windowObjectReference === null || options.windowObjectReference.closed){
				this.open(
					null,
					function(){
						this.hidePlatterTab();
					}.bind(this)
				);
				this.emit("openedPlatterWindow",true);
			}
			else{
				options.windowObjectReference.focus();
				this.emit("focusedPlatterWindow",true);
			}
		}
		else{
			console.log("show element pane");
		}
	}.bind(this);

	var closePlatterWindowEventHandler = function(e){
		// console.log("closed window");
		this.showPlatterTab();
	}.bind(this);

	this.childPlatterWindowClickEventHandler = function(e){
		console.log(e);
	};

	function callCallBack(callback){
		if(typeof callback ==='function'){
			callback();
		}
	}

	this.testWriteToChild = function(html){
		options.windowObjectReference.document.write('writing more:'+html);
	};
};

util.inherits(platter,events.EventEmitter);
platter.prototype.testfunc = function() {
	console.log("teeestie");
};

module.exports = platter;

// If there is a window object, that at least has a document property,
// define linotype
if ( typeof window === "object" && typeof window.document === "object" ) {
	window.platter = platter;
}