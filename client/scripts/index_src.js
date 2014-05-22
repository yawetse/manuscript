'use strict';

var manuscript = require('../../lib/manuscript'),
	manuscriptapp = new manuscript({
		idSelector : 'template'
	});
// manuscript.addOneMore = function(){
// 	console.log("added plugin");
// };
window.onload = function(){
	manuscriptapp.init();
};

window.manuscriptapp = manuscriptapp;