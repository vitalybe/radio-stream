Localhost vs real-server
========================

To run locally, add to HOSTS file:

    127.0.0.1   whoisvitaly.ddns.net

To run via a real server, remove that line.

Running
=======

Development
-----------

* Web

    1. `run-web.bat`
    1. Connect via browser to: http://whoisvitaly.ddns.net:3000

* Desktop: `run-desktop.bat`

Production
----------

On server:

1. Desktop - Create package: `npm run build-desktop-prod`
1. Web - Compile and serve prod html/js: `run-web-prod.bat`

On client - Connect via browser/desktop-app to server: 
    
    * Browse to: `http://whoisvitaly.ddns.net:3000`
    * Run: .\release\win32-x64\music-stream-www-win32-x64\music-stream-www.exe