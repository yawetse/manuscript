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
platterData = new platter({
	idSelector : 'data'
});
platterAssets = new platter({
	idSelector : 'assets'
});

window.onload = function(){
	// console.log("window loaded");
	platterDoc.init();
	platterData.init();
	platterAssets.init();
};

window.platterAssets = platterAssets;

platterDoc.on("intializedPlatter",function(data){
	// console.log("got event",data);
	var a = data;
});