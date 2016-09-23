Usage
=====

To quickly create a development server do: 

1. Make sure Docker is running.
1. `run_server_test.sh` 
    
This would pull the latest version of "radio-stream" server from docker and override beets code with the code development version in `../beets`.

You can also provide arguments to beets when running it, e.g: `run_server_test.sh beet ls`. 
Alternatively you can just login to the shell by runing `run_server_test.sh sh`