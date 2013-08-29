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

var l = require("hyperlevel");

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

	// sift3 distance
	// see https://gist.github.com/KenanSulayman/6041446 & http://jsperf.com/odl-ddl-ndl
	var s3 = function(c, a) {
	        if (null == c || 0 === c.length) return null == a || 0 === a.length ? 0 : a.length;
	        if (null == a || 0 === a.length) return c.length;
	        for (var b = 0, e = 0, f = 0, g = 0; b + e < c.length && b + f < a.length;) {
	                if (c[b + e] == a[b + f]) g++;
	                else
	                        for (var d = e = f = 0; 5 > d; d++) {
	                                if (b + d < c.length && c[b + d] == a[b]) {
	                                        e = d;
	                                        break
	                                }
	                                if (b + d < a.length && c[b] == a[b + d]) {
	                                        f = d;
	                                        break
	                                }
	                        }
	                b++
	        }
	        
	        return 1 - ( ((c.length + a.length) / 2 - g) / Math.sqrt(Math.max(c.length, a.length) * Math.sqrt(c.length * a.length)) );
	};

	var _ar = function (arr, from, to) {
                var rest = arr.slice((to || from) + 1 || arr.length);
                arr.length = from < 0 ? arr.length + from : from;
                return arr.push.apply(arr, rest);
        };

nq = function ( path ) {
	if ( path.constructor === String )
		this._db = l(path);
	else // let's assume this is a database
		this._db = path;

	this._st = "\xab",
	this._max = "\xac",
	this._rindex = "\xaf";

	// expose the helpful utils
		this.l3c = l3c,
		this.s3 = s3;

	// find tags by id
	this._traverse = function ( key, cb ) {
		var self = this;

		var _ref = [], _st = self._st;

		self._db.createKeyStream({ start: self._rindex + l3c(key), end: self._rindex + l3c(key) + self._max })
			.on("data", function (data) {
				_ref.push(data.substr(data.indexOf(_st)+1))
			})
			.on("end", function () {
				cb && cb(_ref);
			})
	}

	// accumulate ^ this [0xEF, 0xF0] => { 0xEF: <list>, 0xF0: <list> }
	this._gather_traverse = function ( keys, cb, list ) {
		var self = this;

		var i = 0, l = keys.length, _res = list ? [] : {};

		keys.forEach(function ( key ) {
			self._traverse ( key, function ( _ref ) {
				if (list)
					_res.push([key, _ref])
				else
					_res[key] = _ref;

				return ++i === l && cb && cb(_res);
			})
		})
	}

	// find id by tag
	this.query = function ( query, opt, cb ) {
		var self = this;

		if ( opt instanceof Function && cb === void 0 ) // allow query ( S, F )
			cb = opt;
		else if ( opt instanceof Function && cb.constructor === Object ) { // allow query ( S, F, O )
			var _; (_ = opt, opt = cb, cb = _); delete _;
		}

		var _ref = [],
		   query = query + (opt && !opt.partial && self._st || "") + ( opt ? ( opt.key && !opt.partial ) ? l3c(opt.key) : "" : "" );

		self._db.createReadStream({ start: query, end: query + self._max, limit: opt ? opt.max ? opt.max : -1 : -1 })
			.on("data", function (data) {
				_ref.push(data)
			})
			.on("end", function () {
				cb && cb(_ref);
			})
	}

	// cut, traverse and profit
	this.search = function ( query, opt, cb ) {
		var self = this;

		if ( opt instanceof Function && cb === void 0 )
			cb = opt;
		else if ( opt instanceof Function && cb.constructor === Object ) {
			var _; (_ = opt, opt = cb, cb = _); delete _;
		}

		if (!(query instanceof Array))
			query = query.split(" ").map(function(v) {
				return v.toLowerCase()
			});

		var _top = opt && opt.top || 100;
		var _stack = [], i = 0, l = query.length;

		query.forEach(function ( a ) {
			self.query(a, {max: (opt && ( opt.max || opt.top )) ? (opt.max || opt.top) : -1, partial: true}, function ( _ref ) {
				_ref.forEach(function ( entry ) {
					_stack.push(entry);
				});

				++i === l && (function ( _ref, cb ) {
					var _uref = [];

					if ( !_ref.length )
						return cb && cb(_uref);

					_ref.filter(function (a) {
						return !~_uref.indexOf(a.value) && _uref.push(a.value)
					});

					self._gather_traverse(_uref, function (_ref) {

						// swap values to order of query
						// in order to improve distance
						// sulayman tarik => tarik sulayman

						_ref.forEach(function (_a, _b){
							_a[1].forEach(function (a, b){

								a = a.toLowerCase();

								var iO = query.indexOf(a);

								if ( !~iO && iO !== b )
									_ar(_a[1], b), _a[1].push(a);
							})
						})

						_ref.forEach(function (a, b) {
							a[2] = s3 ( query.join(""), a[1].join("") )
						})

						_ref = _ref.sort(function (a, b){
							return b[2] - a[2]
						});

						cb(_ref);
					}, true)
				})(_stack, cb);
			});
		})
	}

	this.index = this.link = function ( ref, key, cb ) {
		var self = this;

		if (!(ref instanceof Array))
			ref = ref.split(" ").map(function(v) {
				return v.toLowerCase()
			});

		if (!(key instanceof Array)) // allow batching
			key = [key];

		var i = 0, l = ref.length;
			
		return key.forEach(function (key) {
			ref.forEach(function (a) {
				self._db.put(a + self._st + l3c(key), key, function () {
					self._db.put(self._rindex + l3c(key) + self._st + a, key, function () {
						return ++i === l && cb && cb();
					});
				});
			})
		});
	}

	this.remove = this.unlink = function ( ref, key, cb ) {
		var self = this;

		if (!(ref instanceof Array))
			ref = ref.split(" ").map(function(v) {
				return v.toLowerCase()
			});

		var i = 0, l = ref.length, keys = [];

		var _finalize = function () {
			self._db.createKeyStream({ start: self._rindex + l3c(key), end: self._rindex + l3c(key) + self._max })
				.on("data", function (data) { self._db.del(data); })
				.on("end", function () { cb && cb() })
		}

		return ref.forEach(function (a) {
			// make sure we're deleting keys corresponding to our key
			self.query(a, { key: key, partial: true }, function (ref) {
				keys.push(ref);

				if ( ++i === l ) {
					i = 0, l = keys.length;

					keys.forEach(function (entry) {
						entry = entry[0];

						if ( !entry )
							return ++i === l && _finalize();

						// must be != not !==
						if ( entry.value != key )
							return ++i === l && _finalize();

						self._db.del(entry.key, function () {
							return ++i === l && _finalize();
						})
					});
				}
			})
		})
	}

	return this;
}

exports.nq = nq;