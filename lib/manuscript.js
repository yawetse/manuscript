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
	platter = require('platterjs'),
	// codemirror = require('../node_modules/codemirror/lib/codemirror'),
	CodeMirror = require('codemirror'),
	path = require('path'),
	util = require('util');

	require('../node_modules/codemirror/addon/edit/matchbrackets');
	require('../node_modules/codemirror/addon/fold/foldcode');
	require('../node_modules/codemirror/addon/fold/comment-fold');
	require('../node_modules/codemirror/addon/fold/indent-fold');
	require('../node_modules/codemirror/addon/fold/brace-fold');
	require('../node_modules/codemirror/addon/fold/foldgutter');
	require('../node_modules/codemirror/mode/css/css');

/**
 * A module that represents a manuscript.
 * @{@link https://github.com/typesettin/manuscript}
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
var manuscript = function(config_options){
	/** module default configuration */
	var options,
		defaults = {
			'verticalCentered' : true
		},
		container,
		documentiFrame = document.getElementById('_mss_document_iframe'),
		documentMenu = document.getElementById('_mss_menu'),
		styleEditor = CodeMirror.fromTextArea(document.getElementById("_mss_panel_textarea_stylepanel"), {
			lineNumbers : true,
		    lineWrapping: true,
			matchBrackets : true,
			mode: "text/x-less",
			gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
		    foldGutter: true
		}),
		platterTemplate = new platter({
			idSelector : 'template'
		}),
		platterAssets = new platter({
			idSelector : 'assets'
		}),
		platterData = new platter({
			idSelector : 'data'
		}),
		platterStyles = new platter({
			idSelector : 'styles',
			platterContentElement: document.getElementById('_mss_panel-style')
		}),
		platterInfoPanel = new platter({
			idSelector : 'info',
			platterContentElement: document.getElementById('_mss_panel-info')
		});

	//extend default options
	options = extend( defaults,config_options );

	/**
	 * intialize a new manuscript
	 */
	this.init = function(){
		documentiFrame.style.height = window.innerHeight+"px";
		documentiFrame.style.width = window.innerWidth+"px";

		platterInfoPanel.init();
		platterTemplate.init();
		platterStyles.init();
		platterData.init();
		platterAssets.init();

		window.platterStyles = platterStyles;
		window.styleEditor = styleEditor;
	}.bind(this);

	function styleWindowResizeEventHandler(e){
		// console.log("resize child window");
		styleEditor.refresh();
	}

	platterStyles.on("openedPlatterPane",function(data){
		var t = setTimeout(function(){
			styleEditor.refresh();
			clearTimeout(t);
		},100);
	});
	platterStyles.on("openedPlatterWindow",function(data){
		var t = setTimeout(function(){
			var newstylesheet = document.createElement("link");
			newstylesheet.setAttribute("type","text/css"); newstylesheet.setAttribute("href",path.dirname(window.location)+"/styles/manuscript.css"); newstylesheet.setAttribute("rel","stylesheet" );
			platterStyles.config().windowObjectReference.document.getElementsByTagName("head")[0].appendChild(newstylesheet);
			styleEditor.refresh();
			styleWindowResizeEventHandler();
			clearTimeout(t);
		},200);

		// console.log(platterStyles.config().windowObjectReference.window);
		platterStyles.config().windowObjectReference.window.addEventListener("resize",styleWindowResizeEventHandler,false);
	});
	platterStyles.on("closedPlatterWindow",function(data){
		var t = setTimeout(function(){
			styleEditor.refresh();
			clearTimeout(t);
		},100);
	});
};

module.exports = manuscript;


// If there is a window object, that at least has a document property,
// define module
if ( typeof window === "object" && typeof window.document === "object" ) {
	window.manuscript = manuscript;
	// window.path = path;
}