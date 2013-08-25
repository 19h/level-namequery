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

// modules
var level = require("level");

// level-namequery
var namequery = require("../");

// util
	function equal() {
		function g(a, b) {
			var c;
			if (isNaN(a) && isNaN(b) && "number" === typeof a && "number" === typeof b || a === b) return !0;
			if ("function" === typeof a && "function" === typeof b || a instanceof Date && b instanceof Date || a instanceof RegExp && b instanceof RegExp || a instanceof String && b instanceof String || a instanceof Number && b instanceof Number) return a.toString() === b.toString();
			if (!(a instanceof Object && b instanceof Object) || (a.isPrototypeOf(b) || b.isPrototypeOf(a)) || a.constructor !== b.constructor || a.prototype !==
				b.prototype || -1 < d.indexOf(a) || -1 < e.indexOf(b)) return !1;
			for (c in b)
				if (b.hasOwnProperty(c) !== a.hasOwnProperty(c) || typeof b[c] !== typeof a[c]) return !1;
			for (c in a) {
				if (b.hasOwnProperty(c) !== a.hasOwnProperty(c) || typeof b[c] !== typeof a[c]) return !1;
				switch (typeof a[c]) {
					case "object":
					case "function":
						d.push(a);
						e.push(b);
						if (!g(a[c], b[c])) return !1;
						d.pop();
						e.pop();
						break;
					default:
						if (a[c] !== b[c]) return !1
				}
			}
			return !0
		}
		var d, e;
		if (1 > arguments.length) return !0;
		for (var f = 1, h = arguments.length; f < h; f++)
			if (d = [], e = [], !g(arguments[0],
				arguments[f])) return !1;
		return !0
	};

// error functions
	var _ef = false;
	tl = function ( t, k, i ) {
		if ( t )
			return (_ef = true), console.log(i + ". [\x1b[39mSUCCESS\x1b[0m] " + k);
		else
			return console.log(i + ". [\x1b[31mFAIL\x1b[0m] " + k);
	}

// Reference-Values
	var s1 = [
		{ key: 'kenan«2932660709', value: '239' },
  		{ key: 'sulayman«2932660709', value: '239' }
  	],
  	s2 = [
  		{ key: 'kenan«2932660709', value: '239' }
  	];

// cool motd
	console.log("\x1b[34m\n __                            ___             \n/\\ \\                     __  /'___\\            \n\\ \\ \\         __     __ /\\_\\/\\ \\__/  __  __    \n \\ \\ \\  __  /'__`\\ /'_ `\\/\\ \\ \\ ,__\\/\\ \\/\\ \\   \n  \\ \\ \\L\\ \\/\\  __//\\ \\L\\ \\ \\ \\ \\ \\_/\\ \\ \\_\\ \\  \n   \\ \\____/\\ \\____\\ \\____ \\ \\_\\ \\_\\  \\/`____ \\ \n    \\/___/  \\/____/\\/___L\\ \\/_/\\/_/   `/___/> \\\n                     /\\____/             /\\___/\n                     \\_/__/              \\/__/\n")
	console.log("\t\x1b[43mlevel-namequery — unit tests\x1b[0m\n");

try {
	nq = namequery(level(__dirname + "/tdb"));
} catch (e) { tl(0,"Opening database failed.",1); process.exit();
} finally { tl(1,"Opening database successful.",1); }

nq.index("Kenan Sulayman", 0xEF, function () {
	tl(1,"Indexing successful.",2);
	nq.query("kenan", function ( _ref ) {
		equal(_ref, s2) ? tl(1, "Query result correct.", 4) : tl(1, "Query result incorrect. (Are sure the database is empty?)", 4);
		nq.query("ken", { partial: true }, function ( _ref ) {
			equal(_ref, s2) ? tl(1, "Partial-Query result correct.", 5) : tl(1, "Partial-Query result incorrect. (Are sure the database is empty?)", 5);
			nq.unlink("Kenan Sulayman", 0xEF, function () {
				tl(1, "Reached unlink callback.", 6)
				nq.query("kenan", function (_ref) {
					_ref.length ? tl(0, "Query result length after unlink incorrect. (Are sure the database is empty?)", 7) : tl(1, "Query result length after unlink correct.", 7);

					if ( !_ef )
						console.log("\n[\x1b[31mNot all tests finished successfully\x1b[0m]")
					else
						console.log("\n[\x1b[36mAll tests finished successfully\x1b[0m]")
				});
			})
		});
	});
})