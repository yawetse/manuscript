'use strict';

var manuscript = require('../../lib/manuscript'),
	manuscriptapp = new manuscript({
		idSelector : 'template'
	});
window.onload = function(){
	manuscriptapp.init();
};

window.manuscriptapp = manuscriptapp;