tell application "iTerm"
	tell first window
		set newTab to (create tab with default profile)
		tell newTab
			set row1_col1 to (item 1 of sessions)

			-- creating columns
			tell row1_col1
				set row1_col2 to (split vertically with same profile)
			end tell
			
			-- running commands
			tell row1_col1 to write text "npm run server-desktop-dev"
			tell row1_col1 to set name to "MusicStream - Server"
			tell row1_col2 to write text "npm run start-desktop-dev"
			tell row1_col2 to set name to "MusicStream - Client"
			
		end tell
	end tell
end tell