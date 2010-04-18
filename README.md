FreePass
========

A little tool that provide a per-site password given a unique master password.
This is not a new idea and has already been implemented by other tools (like SuperGenPass [1]) but I wanted to try some ideas I had about security with that project.


Licence
-------

All code provided by me is released in the public domain. Some external code is also used and their respective licence is to be observed.

How it works
------------

When you call the bookmarklet, it opens a new window. That window will provide a simple interface that generates a password, given a master password and a domain.

When you click on generate, the password is transmitted to your calling window trought the HTML5 postMessage API. Now that the page has the site-password, password input elements are then simply filled when you double-click on them. A visual cue is also provided to let you know the password has been filled correctly.

Installation
------------

Just put the files in a public location. No kind of server-side scripting is required.

If you want to develop on the code, you will need `ruby`, `rake` and the `closure-compiler` gem.

Compatiblity
------------

The project has only been tested on Firefox 3.6. The password generation should work on all browsers but some may not provide the postMessage API and thus the bookmarklet may not be supported.

FreePass vs SuperGenPass [1]
------------------------

- Needs internet connection
+ Not vulnerable to dom tempering and overlay capture
+ Forkable project

Security
--------

Brute-force: since the salt is known for a given site, it is easier for the attacker to find your password by brute-force in a targetted attack.

FreePass mobile semi-vulnerability: by copying the password in the clipboard, it lets other running applications (and flash?) capture a website's password.

Future ideas
------------

* Check bookmarklet version on site (and propose upgrade if necessary)
* Make usability testing
* Provide more doc
* Make a security audit
* Add some unit-tests (with nodejs ?)
* Provide a command-line tool for password generation (with nodejs ?)
* Publish the password-generation algorithm

Links
-----

[1] http://supergenpass.com/ - Another project that does about the same

http://postmessage.freebaseapps.com/ - Backward-compatible postMessage implementation
http://closure-compiler.appspot.com/ - Javascript compression REST-API
