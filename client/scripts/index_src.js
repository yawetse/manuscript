'use strict';

var platter = require('../../lib/platter'),
	platterDoc,
	platterAssets,
	platterData,
	platterStyles,
	platterInfoPanel;

platterDoc = new platter({
	idSelector : 'document'
});

window.onload = function(){
	console.log("window loaded");
	platterDoc.init();
};

platterDoc.on("intializedPlatter",function(data){
	console.log("got event",data);
});