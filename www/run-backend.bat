ConEmu.exe /single /cmd cmd /k "%ConEmuDir%\..\init.bat & cd server & api.py" -cur_console:s50V:n:t:"backend":C:"c:\Users\Vitaly\Dropbox\Utils\Cmder\icons\flask.ico"
taskkill /f /im nginx.exe
ConEmu.exe /single /cmd cmd /k "%ConEmuDir%\..\init.bat & cd c:\nginx\ & nginx" -cur_console:s50V:n:t:"nginx":C:"c:\Users\Vitaly\Dropbox\Utils\Cmder\icons\nginx.ico"

cd www
ConEmu.exe /single /cmd cmd /k "%ConEmuDir%\..\init.bat" -new_console:t:"cmd":C:"c:\Users\Vitaly\Dropbox\Utils\Cmder\Cmder.exe"
sleep 1
exit