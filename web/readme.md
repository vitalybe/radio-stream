Development
=======

Running
-----------

Run in 2 terminals:
* `npm run server-desktop-dev` - This starts webpack and transpiles the application
* `npm run start-desktop-dev` - This launches electron and loads the bundle inside it

Alternatively, if you're on OSX and using iTerm, you can use instead: `npm run iterm-desktop-dev`

Test
====

Running in shell
----------------
To run: `node ./node_modules/mocha/bin/_mocha --compilers js:babel-register --recursive --require babel-polyfill`

To run in a a watch mode use `node watch` in line above.
To debug use `node debug` in line above.


Running Mocha tests in PyCharm
------------------------------

1. Add to mocha default options in PyCharm configuration: `Extra mocha options: --compilers js:babel-register`
1. (Optional) To handle the issue of [missing file links](https://intellij-support.jetbrains.com/hc/en-us/community/posts/203331070-File-name-isn-t-clickable-in-Mocha-output)
   Copy **www/scripts/mocha_reporter_for_pycharm.js** to **/Users/vitaly/Library/Application Support/PyCharm50/NodeJS/js/mocha-intellij/lib/mochaIntellijReporter.js**

Releasing
==========

OSX
----

Create package: 

`npm run build-desktop-prod`

Copy to **Applications**:

`release/darwin-x64/Radio Stream-darwin-x64/Radio Stream.app`