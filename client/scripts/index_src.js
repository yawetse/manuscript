'use strict';

var manuscript = require('../../lib/manuscript'),
	manuscriptapp = new manuscript({
		idSelector : 'template'
	});

window.onload = function(){
	manuscriptapp.init();
};

// manuscript.downloadRenderedOutput = function(obj){
// 	console.log("overwrite method",obj.config());
// };

manuscriptapp.on("intializedManuscript",function(data){
	console.log("loaded manuscript",data);
});

window.manuscriptapp = manuscriptapp;