ConEmu.exe /single /cmd cmd /k "%ConEmuDir%\..\init.bat & cd www & npm start" -cur_console:s50V:n:t:"web"
ConEmu.exe /single /cmd cmd /k "%ConEmuDir%\..\init.bat & cd server & api.py" -cur_console:s50V:n:t:"backend"
ConEmu.exe /single /cmd cmd /k "%ConEmuDir%\..\init.bat & cd c:\nginx\ & nginx" -cur_console:s50V:n:t:"nginx"
ConEmu.exe /single /cmd cmd /k "%ConEmuDir%\..\init.bat" -new_console:t:"cmd"
sleep 1
exit