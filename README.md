Radio Stream - Development repository
====================================

**NOTE:** These instructions are intended for developers of Radio Stream - If you just want to listen to music [go here](https://github.com/vitalybe/radio-stream-cli).

About
=====
The goal of this project is to provide an easy music listening experience for the user via auto generated playlists.

You can read additional details about user-related goals of this project [here](https://github.com/vitalybe/radio-stream-cli).

<p align="center">
  <img src="https://raw.githubusercontent.com/vitalybe/radio-stream-cli/master/images/android.jpg" alt="Radio Stream for Android"/>
</p>

Architecture
============

Overview
---------

![alt text](images/architecture.png "architecture overview") 

Server
------
Composed of 2 main components.

**Docker container**

Docker was used to provide easy deployment and minimize required configuration for the user. It consists of the following subcomponents:
* beets - A [fork of beets](https://github.com/vitalybe/beets) that adds a specialized plugin for generating automatic playlists, updating play counts, ratings, etc. The plugin by default is listening for HTTP requests on internal port.
* nginx - Exposes a single HTTP endpoint for clients. Based on the incoming URL it either serves as proxy for beets or exposes the underlying music files.

**Launcher ([radio-stream-cli](https://github.com/vitalybe/radio-stream-cli))**

This is the server-side application that the user interacts with to control the docker container and execute beets inside it.

**Client applicationsn**

* Android application - Developed using react-native.
* Desktop application - Developed with electron. 


Development
===========

Getting started
---------------
    git clone --recursive https://github.com/vitalybe/radio-stream
    cd readio-stream
    # Prepare test hooks
    cp scripts/pre-commit .git/hooks/pre-commit

Then proceed to a specific folder and follow its readme:

* Server - "[server](https://github.com/vitalybe/radio-stream/tree/master/server)" folder. 
* Desktop application - "[web](https://github.com/vitalybe/radio-stream/tree/master/web)" folder. 
* Android application - [mobile](https://github.com/vitalybe/radio-stream/tree/master/mobile)" folder. 


Contributions
=============

Pull requests are most welcome. The main areas of focus I would love to see this project expand:

* Ability to create automatic playlists from clients.
* Ability to add music from clients - Currently requires to copy files to the computer running the server and running beet import funcionality.
* Unify web and mobile codebases - Since both electron and react-native rely on javascript, some code elements can be shared between the projects.
* Windows support - Should be relatively easy to do since electron supports windows already. Mac specific code is very minimal.
* Web-only mode - The native parts in this application are minimal so this shouldn't be too hard.
* iPhone support
