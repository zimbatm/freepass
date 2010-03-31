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

Get the closure-compiler rubygem and run `rake` to generate the bookmarklet.min.js file. Then put the code in a PHP-enabled website and it should work out of the box. I'm not using fancy PHP features (I think), only some utilities to make my hack easier.

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

It is possible, like SuperGenPass to detect the addition of FreePass to the page.
Unlike SuperGenPass, it is not possible for another script to find the password element and read it's value, since it lives in another window, on another domain (the browser should! protect it).

FreePass mobile semi-vulnerability: by copying the password in the clipboard, it lets other running applications (and flash?) capture a website's password.

TODOs
-----

* Provide more documentation
* Security checks
* More user-friendly stuff

Future ideas
------------

* Implement an optional storage to remember specific site passwords. (and user login)
* Find a better name for the project

Links
-----

[1] http://supergenpass.com/ - Another project that does about the same

http://postmessage.freebaseapps.com/ - Backward-compatible postMessage implementation
http://closure-compiler.appspot.com/ - Javascript compression REST-API