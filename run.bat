ConEmu.exe /single /cmd cmd /k "%ConEmuDir%\..\init.bat & cd www & npm start" -cur_console:s50V:n:t:"web":C:"c:\Users\Vitaly\Dropbox\Utils\Cmder\icons\webpack.ico"
ConEmu.exe /single /cmd cmd /k "%ConEmuDir%\..\init.bat & cd server & api.py" -cur_console:s50V:n:t:"backend":C:"c:\Users\Vitaly\Dropbox\Utils\Cmder\icons\flask.ico"
ConEmu.exe /single /cmd cmd /k "%ConEmuDir%\..\init.bat & cd c:\nginx\ & nginx" -cur_console:s50V:n:t:"nginx":C:"c:\Users\Vitaly\Dropbox\Utils\Cmder\icons\nginx.ico"
ConEmu.exe /single /cmd cmd /k "%ConEmuDir%\..\init.bat" -new_console:t:"cmd":C:"c:\Users\Vitaly\Dropbox\Utils\Cmder\Cmder.exe"
sleep 1
exit