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
	ribbon = require('ribbonjs'),
	CodeMirror = require('codemirror'),
	less = require('less'),
	saveAs = require('filesaver.js'),
	ejs = require('ejs'),
	path = require('path'),
	util = require('util'),
	ribbonNotification = new ribbon({type:"info",idSelector:"#_mms_ribbon-element"});

	require('../node_modules/codemirror/addon/edit/matchbrackets');
	require('../node_modules/codemirror/addon/comment/comment');
	require('../node_modules/codemirror/addon/comment/continuecomment');
	require('../node_modules/codemirror/addon/fold/foldcode');
	require('../node_modules/codemirror/addon/fold/comment-fold');
	require('../node_modules/codemirror/addon/fold/indent-fold');
	require('../node_modules/codemirror/addon/fold/brace-fold');
	require('../node_modules/codemirror/addon/fold/foldgutter');
	require('../node_modules/codemirror/mode/css/css');
	require('../node_modules/codemirror/mode/htmlembedded/htmlembedded');
	require('../node_modules/codemirror/mode/javascript/javascript');

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
			'verticalCentered' : true,
			filename: 'newdoc'
		},
		savefile ={
			info:null,
			layout: null,
			stylesheets:null,
			scripts:null,
			data:null,
			templates:null
		},
		container,
		lessparser = new less.Parser({}),
		documentiFrame = document.getElementById('_mss_document_iframe'),
		documentMenu = document.getElementById('_mss_menu'),
		styleEditor = CodeMirror.fromTextArea(document.getElementById("_mss_panel_textarea_stylepanel"), {
			lineNumbers : true,
		    lineWrapping: true,
			matchBrackets : true,
			mode: "text/x-less",
			indentUnit: 4,
			indentWithTabs: true,
			lint: true,
			gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
		    foldGutter: true
		}),
		templateEditor = CodeMirror.fromTextArea(document.getElementById("_mss_panel_textarea_templatepanel"), {
			lineNumbers : true,
		    lineWrapping: true,
			matchBrackets : true,
			mode: "application/x-ejs",
			indentUnit: 4,
			indentWithTabs: true,
			// lint: true,
			gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
		    foldGutter: true
		}),
		dataEditor = CodeMirror.fromTextArea(document.getElementById("_mss_panel_textarea_datapanel"), {
			lineNumbers : true,
		    lineWrapping: true,
			matchBrackets : true,
			autoCloseBrackets: true,
			mode: "application/json",
			indentUnit: 4,
			indentWithTabs: true,
			// lint: true,
			gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
		    foldGutter: true
		}),
		platterTemplate = new platter({
			idSelector : 'template',
			platterContentElement: document.getElementById('_mss_panel-template')
		}),
		platterData = new platter({
			idSelector : 'data',
			platterContentElement: document.getElementById('_mss_panel-data')
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
		documentiFrame.style.height = '768px';// window.innerHeight+"px";
		documentiFrame.style.width = '1024px';//window.innerWidth+"px";


		platterInfoPanel.init();
		platterTemplate.init();
		platterStyles.init();
		platterData.init();
		this.updatePreview();

		// window.platterStyles = platterStyles;
		// window.styleEditor = styleEditor;
		// this.saveMMS();
		// manuscript.downloadRenderedOutput(this);
		this.addMenuBarListeners();
		this.addInfoPanelListeners();
		updateInfoFilename();
		addEventBindings();

		this.emit("intializedManuscript",true);

	}.bind(this);


	this.getFileName = function(){
		return options.filename;
	};

	this.getRenderedOutput = function(){
		console.log("in rend out");
		var lessdata = styleEditor.getValue(),
			templateLayout,
			outputTemplate,
			previewOutput = false;
		lessparser.parse(lessdata,function(error,rendered){
			if(error){
				ribbonNotification.showRibbon("LESS css error: "+error,2000,"error");
				console.log(error);
			}
			else{
				templateLayout = templateEditor.getValue();
				try{
					outputTemplate = ejs.render(templateLayout, {
						datapanel: dataEditor.getValue(),
						csspanel: rendered.toCSS(),
						open:"{{",
						close:"}}"
					});
				}
				catch(e){
					ribbonNotification.showRibbon("Template Error: "+error,2000,"error");
					console.log(e);
				}
				try{
					previewOutput = ejs.render(outputTemplate);
				}
				catch(e){
					ribbonNotification.showRibbon("Template Error: "+error,2000,"error");
					console.log(e);
				}
			}
		});
		return previewOutput;
	};

	this.updatePreview = function(){
		var previewOutput = this.getRenderedOutput();
		if(previewOutput){
			documentiFrame.contentDocument.open();
			documentiFrame.contentDocument.write(previewOutput);
			documentiFrame.contentDocument.close();
		}
	}.bind(this);

	this.addInfoPanelListeners = function(childWindow){
		var info_dimension_width,
			info_dimension_option,
			info_dimension_filename,
			info_dimension_height;
		if(typeof childWindow !== 'undefined' && childWindow===true){
			info_dimension_width = platterInfoPanel.config().windowObjectReference.document.getElementById("_mss_panel-info-dimension-width"),
			info_dimension_height = platterInfoPanel.config().windowObjectReference.document.getElementById("_mss_panel-info-dimension-height"),
			info_dimension_option = platterInfoPanel.config().windowObjectReference.document.getElementById("_mss_panel-info-dimension-option");
			info_dimension_filename = platterInfoPanel.config().windowObjectReference.document.getElementById("_mss_panel-info-filename");

			info_dimension_filename.addEventListener("keyup",updateInfoFilename_childWindow, false);
			info_dimension_option.addEventListener("change",updateInfoDimensions_childWindow, false);
			info_dimension_width.addEventListener("change",updatePreviewPaneSize_childWindow, false);
			info_dimension_height.addEventListener("change",updatePreviewPaneSize_childWindow,false);
		}
		else{
			info_dimension_width = document.getElementById("_mss_panel-info-dimension-width"),
			info_dimension_height = document.getElementById("_mss_panel-info-dimension-height"),
			info_dimension_option = document.getElementById("_mss_panel-info-dimension-option");
			info_dimension_filename = document.getElementById("_mss_panel-info-filename");

			info_dimension_filename.addEventListener("keyup",updateInfoFilename, false);
			info_dimension_option.addEventListener("change",updateInfoDimensions, false);
			info_dimension_width.addEventListener("change",updatePreviewPaneSize, false);
			info_dimension_height.addEventListener("change",updatePreviewPaneSize,false);
		}

	};

	this.addMenuBarListeners = function(){
		document.getElementById("_mss_export-mms-to-html").addEventListener("click",exportToHTMLClickEventHandler, false);
	};

	var exportToHTMLClickEventHandler = function(e){
		manuscript.downloadRenderedOutput(this);
	}.bind(this);

	function updateInfoFilename_childWindow(e){
		updateInfoFilename(e,true);
	}

	function updateInfoFilename(e,childWindow){
		if(typeof childWindow !== 'undefined' && childWindow===true){
			options.filename = platterInfoPanel.config().windowObjectReference.document.getElementById("_mss_panel-info-filename").value;
		}
		else{
			options.filename = document.getElementById("_mss_panel-info-filename").value;
		}
	}

	function updateInfoDimensions_childWindow(e){
		updateInfoDimensions(e,true);
	}

	function updateInfoDimensions(e,childWindow){
		var info_dimension_width,
			info_dimension_option,
			info_dimension_height;
		if(typeof childWindow !== 'undefined' && childWindow===true){
			info_dimension_option = platterInfoPanel.config().windowObjectReference.document.getElementById("_mss_panel-info-dimension-option"),
			info_dimension_width = platterInfoPanel.config().windowObjectReference.document.getElementById("_mss_panel-info-dimension-width"),
			info_dimension_height = platterInfoPanel.config().windowObjectReference.document.getElementById("_mss_panel-info-dimension-height");
		}
		else{
			info_dimension_option = document.getElementById("_mss_panel-info-dimension-option"),
			info_dimension_width = document.getElementById("_mss_panel-info-dimension-width"),
			info_dimension_height = document.getElementById("_mss_panel-info-dimension-height");
		}

		switch(info_dimension_option.value){
			case "max":
				info_dimension_width.value=window.innerWidth+"px";
				info_dimension_height.value=window.innerHeight+"px";
				break;
			case "desktop":
				info_dimension_width.value='1200px';
				info_dimension_height.value='900px';
				break;
			case "tablet-vert":
				info_dimension_width.value='768px';
				info_dimension_height.value='1024px';
				break;
			case "tablet-horz":
				info_dimension_width.value='1024px';
				info_dimension_height.value='768px';
				break;
			case "mobile-vert":
				info_dimension_width.value='320px';
				info_dimension_height.value='480px';
				break;
			case "mobile-horz":
				info_dimension_width.value='480px';
				info_dimension_height.value='320px';
				break;
			default:
				break;
		}

		updatePreviewPaneSize(e,childWindow);
	}

	function updatePreviewPaneSize_childWindow(e){
		updatePreviewPaneSize(e,true);
	}

	function updatePreviewPaneSize(e,childWindow){
		if(typeof childWindow !== 'undefined' && childWindow===true){
			documentiFrame.style.height = platterInfoPanel.config().windowObjectReference.document.getElementById("_mss_panel-info-dimension-height").value;
			documentiFrame.style.width = platterInfoPanel.config().windowObjectReference.document.getElementById("_mss_panel-info-dimension-width").value;
		}
		else{
			documentiFrame.style.height = document.getElementById("_mss_panel-info-dimension-height").value;
			documentiFrame.style.width = document.getElementById("_mss_panel-info-dimension-width").value;
		}

		documentiFrame.style['margin-top'] = parseInt((window.innerHeight - documentiFrame.clientHeight) / 2,10)+'px';
	}

	function styleWindowResizeEventHandler(e){
		styleEditor.refresh();
		styleEditor.setSize("auto","80%");
	}
	function templateWindowResizeEventHandler(e){
		templateEditor.refresh();
		templateEditor.setSize("auto","80%");
	}
	function dataWindowResizeEventHandler(e){
		dataEditor.refresh();
		dataEditor.setSize("auto","80%");
	}
	var addStyleSheetToChildWindow = function(platter,refreshType){
		var t = setTimeout(function(){
			var newstylesheet = document.createElement("link");
			newstylesheet.setAttribute("type","text/css"); newstylesheet.setAttribute("href",path.dirname(window.location)+"/styles/manuscript.css"); newstylesheet.setAttribute("rel","stylesheet" );
			platter.config().windowObjectReference.document.getElementsByTagName("head")[0].appendChild(newstylesheet);

			switch(refreshType){
				case 'style':
					styleWindowResizeEventHandler();
					break;
				case 'template':
					templateWindowResizeEventHandler();
					break;
				case 'data':
					dataWindowResizeEventHandler();
					break;
			}
			clearTimeout(t);
		},200);

		switch(refreshType){
			case 'style':
				platter.config().windowObjectReference.window.addEventListener("resize",styleWindowResizeEventHandler,false);
				break;
			case 'template':
				platter.config().windowObjectReference.window.addEventListener("resize",templateWindowResizeEventHandler,false);
				break;
			case 'data':
				platter.config().windowObjectReference.window.addEventListener("resize",dataWindowResizeEventHandler,false);
				break;
			case 'info':
				this.addInfoPanelListeners(true);
				break;
		}
	}.bind(this);
	function refreshAllStyleEditors(){
		refreshStyleEditor();
		refreshTemplateEditor();
		refreshDataEditor();
	}
	function refreshStyleEditor(){
		var t = setTimeout(function(){
			styleEditor.refresh();
			clearTimeout(t);
		},100);
	}
	function refreshTemplateEditor(){
		var t = setTimeout(function(){
			templateEditor.refresh();
			clearTimeout(t);
		},100);
	}
	function refreshDataEditor(){
		var t = setTimeout(function(){
			dataEditor.refresh();
			clearTimeout(t);
		},100);
	}
	var liveUpdatePreview = function(){
		var t = setTimeout(function(){
			this.updatePreview();
			clearTimeout(t);
		}.bind(this),1000);
	}.bind(this);

	function addEventBindings(){
		templateEditor.on("change",liveUpdatePreview);
		styleEditor.on("change",liveUpdatePreview);
		dataEditor.on("change",liveUpdatePreview);
		platterInfoPanel.on("openedPlatterPane",function(data){
			refreshAllStyleEditors();
		});
		platterInfoPanel.on("openedPlatterWindow",function(data){
			addStyleSheetToChildWindow(platterInfoPanel,'info');
		});
		platterInfoPanel.on("closedPlatterWindow",function(data){
			// refreshStyleEditor();
		});
		platterStyles.on("openedPlatterPane",function(data){
			refreshAllStyleEditors();
		});
		platterStyles.on("openedPlatterWindow",function(data){
			addStyleSheetToChildWindow(platterStyles,'style');
		});
		platterStyles.on("closedPlatterWindow",function(data){
			refreshStyleEditor();
		});
		platterTemplate.on("openedPlatterPane",function(data){
			refreshAllStyleEditors();
		});
		platterTemplate.on("openedPlatterWindow",function(data){
			addStyleSheetToChildWindow(platterTemplate,'template');
		});
		platterTemplate.on("closedPlatterWindow",function(data){
			refreshTemplateEditor();
		});
		platterData.on("openedPlatterPane",function(data){
			refreshAllStyleEditors();
		});
		platterData.on("openedPlatterWindow",function(data){
			addStyleSheetToChildWindow(platterData,'data');
		});
		platterData.on("closedPlatterWindow",function(data){
			refreshDataEditor();
		});
	}
};
util.inherits(manuscript,events.EventEmitter);

manuscript.downloadRenderedOutput = function(obj){
	var renderedOutput = obj.getRenderedOutput();
	if(renderedOutput){
		var blob = new Blob([renderedOutput], {type: "text/html;charset=utf-8"});
		saveAs(blob, obj.getFileName()+".html");
		ribbonNotification.showRibbon("Rendered HTML Preview Ready",2000,"success");
	}
};

module.exports = manuscript;


// If there is a window object, that at least has a document property,
// define module
if ( typeof window === "object" && typeof window.document === "object" ) {
	window.manuscript = manuscript;
	// window.path = path;
}