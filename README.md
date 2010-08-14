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

See "Offline mode" section if you want FreePass to be available when not connected on the web.

If you want to develop on the code, you will need `ruby`, `rake` and the `closure-compiler` gem.

Offline mode
------------

It is possible to use FreePass when not connected on the web. Using the new HTML5 offline mode, some modern browser will keep a copy of the FreePass website.

To make it work, make sure your browser supports that feature, and configure your webserver to serve the "index.manifest" file with "text/cache-manifest" content-type.

Apache2 configuration:

    <IfModule mod_mime.c>
       AddType text/cache-manifest .manifest
    </IfModule>


Compatiblity list:
  - Chrome 5.0.342.9 beta (Mac)
  - Firefox 3.6 (Mac)
  
Uncompatiblity list:
  - Safari 4.0.5 (Mac)

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
* Use http://publicsuffix.org/

Links
-----

[1] http://supergenpass.com/ - Another project that does about the same

http://postmessage.freebaseapps.com/ - Backward-compatible postMessage implementation
http://closure-compiler.appspot.com/ - Javascript compression REST-API
