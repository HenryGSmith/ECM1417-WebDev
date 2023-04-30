# page content
- nav bar
    - register switches to icon
    - allows you to change profile on click
- dynamically scaling background image

# landing page
- if not registered prompt to register
- if registered 'click to play' button

# Registration page
- field for username
    - checks for invalid input and blocks submit button while invalid
- options for icon under 3 tabs
- avitar image updates in real time to show selection
- if registered username will already populate username feild
    - title changes to 'update profile'
    - submit changes to 'update'
- profile saved to cookie and session variables

# Pairs game page
- Complex attempted
- music plays on game start
    - 3 songs on shuffle then repeat
- level select screen unlocks as levels completed
- each level shows best time under level button
- level
    - ability to pause the game
    - lives based on number of matches to be made
    - score based on time and number of attempts
    - for each re-attempt background is gold when score is higher than previous attempt, become grey once score is lower
    - upon level completion time and score are saved to json
- all buttons are animated
- all cards are animated
- progress saves as a cookie so the page can be closed and refreshed without loosing best times or level unlocks 

# Leaderboard page
- leaderboard displays top 100 players
- shows rank, icon, username, total score, and level scores/times
