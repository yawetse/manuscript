/*
 * platter
 * http://github.com/typesettin/platter
 *
 * Copyright (c) 2014 Yaw Joseph Etse. All rights reserved.
 */

'use strict';

var should = require('chai').should(),
	expect = require('chai').expect,
	Platter = require('../lib/platter'),
	Browser = require("zombie"),
	path = require("path");

describe('DOM Manipulation', function () {
	describe('Initializing Page Settings', function () {
		var platter;
		before(function(){
			this.browser = new Browser();
			this.browser.on("error",function(error){
				console.error(error);
			});
		});

		before(function(done){
			this.browser.visit("file://"+path.resolve(__dirname,"../public/index.html"),done);
		});

		it('should return configuration object', function () {
			platter = new this.browser.window.platter();
			expect(platter.config()).to.be.a("object");
		});
	});
});