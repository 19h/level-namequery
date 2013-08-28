Legify Namequery
=============

A search engine on top of LevelDB for Name <-> User-ID relations. This applies to environments where users are identified by an id but still referenced by name.

Why it's so awesome and why you should use it
------------

*Namequery*'s .search interface gathers search-results and ranks them based on their sift3-distance to the users' query. It even reorders the query to get a better fit on the rank and is extremely fast. It's space-saving and can handle billions of entries easily. :)

Installation
------------

  `npm install level-namequery`

Usage
------------

Include `level-namequery` and initialize it with a level-instance. If the initialization parameter is a string, namequery will try to spawn a new level-instance in the given path.

	var level = require("level"),
		namequery = require("level-namequery");

	var nq = namequery("test");

You'll most probably start by indexing a user.

	nq.index("Kenan Sulayman", "userid", function () {});

Namequery will now relate "userid" to "kenan" and "sulayman". You can query the user with an easy interface:

	nq.search("sul kenan", function ( _ref ) {
		// _ref is [[0xEF, ['kenan', 'sulayman'], 0.4354747839116936 ]]
	}); 

Unlinking an entry is easy, too:

	nq.unlink("Kenan Sulayman", "userid", function () {});

All relations to "userid" will be deleted.

License
------------

Copyright (c) 2013 by Legify UG. All Rights Reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the 'Software'), to deal in
the Software without restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
