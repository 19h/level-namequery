/*
         __                            ___             
        /\ \                     __  /'___\            
        \ \ \         __     __ /\_\/\ \__/  __  __    
         \ \ \  __  /'__`\ /'_ `\/\ \ \ ,__\/\ \/\ \   
          \ \ \L\ \/\  __//\ \L\ \ \ \ \ \_/\ \ \_\ \  
           \ \____/\ \____\ \____ \ \_\ \_\  \/`____ \ 
            \/___/  \/____/\/___L\ \/_/\/_/   `/___/> \
                             /\____/             /\___/
                             \_/__/              \/__/
 
        Copyright (c) 2013 by Legify UG. All Rights Reserved.
 
        Permission is hereby granted, free of charge, to any person obtaining a copy
        of this software and associated documentation files (the "Software"), to deal
        in the Software without restriction, including without limitation the rights
        to use, copy, modify, merge, publish, distribute, sublicense and to permit
        persons to whom the Software is furnished to do so, subject to the following
        conditions:
 
        The above copyright notice and this permission notice shall be included in
        all copies, substantial portions or derivates of the Software.
 
        THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
        IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
        FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
        AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
        LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
        OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
        THE SOFTWARE.
*/

var l = require("level");

// utils
	var l3c = (function () {
	        var f = 0xC0DEBABE,
	            g = 0xDEADCAFE,
	            h = 0xBEEFFEED;
	        return  function(d) {
	                var k = function(a) {
	                        for (var b = 32, c = 0; b;) c = 2 * c + a % 2, a /= 2, a -= a % 1, b--;
	                        return c
	                }
	                d = String(d);
	                var e = g,
	                        l = [],
	                        a, c, b;
	                for (a = 255; 0 <= a; a--) {
	                        b = k(a);
	                        for (c = 0; 8 > c; c++) b = (2 * b ^ (b >>> 31) % 2 * f) >>> 0;
	                        l[a] = k(b)
	                }
	                for (a = 0; a < d.length; a++) {
	                        b = d.charCodeAt(a);
	                        if (255 < b) throw new RangeError;
	                        c = e % 256 ^ b;
	                        e = (e / 256 ^ l[c]) >>> 0
	                }
	                return (e ^ h) >>> 0
	        };
	})();

	// random pad
	var uuid = function() {
		return "10000000-1000-4000-8000-100000000000".replace(
			/[018]/g,
			function(a) {
				return (
					a ^ Math.random() * 16 >> a / 4
				).toString(16)
			}
		)
	};


var nq = function ( path ) {
	if ( path.constructor === String )
		this._db = l(path);
	else // let's assume this is a database
		this._db = path;

	this._st = "\xab",
	// expose the helpful utils
		this.l3c = l3c,
		this.uuid = uuid;

	this.query = function ( query, opt, cb ) {
		if ( opt instanceof Function && cb === void 0 ) // allow query ( S, F )
			cb = opt;
		else if ( opt instanceof Function && cb.constructor === Object ) { // allow query ( S, F, O )
			var _; (_ = opt, opt = cb, cb = _); delete _;
		}

		var _ref = [],
		   query = query + (opt && !opt.partial && this._st || "") + ( opt ? opt.key ? l3c(opt.key) : "" : "" );

		this._db.createReadStream({start: query, end: query + "\xac"})
			.on("data", function (data) {
				_ref.push(data)
			})
			.on("end", function () {
				cb && cb(_ref);
			})
	}

	this.index = this.link = function ( ref, key, cb ) {
		var db = this._db;

		if (!(ref instanceof Array))
			ref = ref.split(" ").map(function(v) {
				return v.toLowerCase()
			});

		var i = 0, l = ref.length;
			
		return ref.forEach(function (a) {
			db.put(a + this._st + l3c(key), key, function () {
				return ++i === l && cb && cb();
			});
		})
	}

	this.remove = this.unlink = function ( ref, key, cb ) {
		var db = this._db;

		if (!(ref instanceof Array))
			ref = ref.split(" ").map(function(v) {
				return v.toLowerCase()
			});

		var i = 0, l = ref.length, keys = [];
			
		return ref.forEach(function (a) {
			// make sure we're deleting keys corresponding to our key
			this.query(a, { key: key }, function (ref) {
				keys.push(ref);

				if ( ++i === l ) {
					i = 0, l = keys.length;

					keys.forEach(function (entry) {
						entry = entry[0];

						// must be != not !==
						if ( entry.value != key )
							return ++i === l && cb && cb();

						this._db.del(entry.key, function () {
							return ++i === l && cb && cb();
						})
					});
				}
			})
		})
	}

	this.createReadStream = this._db.createReadStream;

	// fight the `new` haters
	return this;
}

module.exports = nq;