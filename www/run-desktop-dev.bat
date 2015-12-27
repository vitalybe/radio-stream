cd..
ConEmu.exe /single /cmd cmd /k "%ConEmuDir%\..\init.bat & cd www & npm run server-desktop-dev" -cur_console:s50V:n:t:"web-server":C:"c:\Users\Vitaly\Dropbox\Utils\Cmder\icons\webpack.ico"
ConEmu.exe /single /cmd cmd /k "%ConEmuDir%\..\init.bat & cd www & FOR /L %%x IN (1,1,100) DO npm run start-desktop-dev" -cur_console:s50V:n:t:"desktop":C:"c:\Users\Vitaly\Dropbox\Utils\Cmder\icons\webpack.ico"
.\www\run-backend.bat