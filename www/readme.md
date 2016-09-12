Running
=======

Development
-----------

* OSX: `npm run iterm-desktop-dev`

Running Mocha tests in PyCharm
------------------------------

1. Add to mocha default options in PyCharm configuration: `Extra mocha options: --compilers js:babel-register`
1. (Optional) To handle the issue of [missing file links](https://intellij-support.jetbrains.com/hc/en-us/community/posts/203331070-File-name-isn-t-clickable-in-Mocha-output)
   Copy **www/scripts/mocha_reporter_for_pycharm.js** to **/Users/vitaly/Library/Application Support/PyCharm50/NodeJS/js/mocha-intellij/lib/mochaIntellijReporter.js**

Production
----------

Create package: `npm run build-desktop-prod`