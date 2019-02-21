G_Login
=================


#### To-do
___

1. Grab user input from a post request and match it against what's in the DB
  1. Just about done with this current problem is redirecting the user after they login, could be the whole "sessions" part of a user login system
2. Add signup functionality




#### Some terminology / definitions for myself
###### **Express-sessions**
- **req.sessionID**
  - A unique read only value that is set when the session is created, it is generated in the configuration of the middleware

this is what I believe to be happening when a user navigates to a webpage, might be wrong or missing something:

user request -> middleware -> response



**Session-file-store**
- A package that will allow me to store sessionIDs in text files


### Questions / problems
- Sessions are being overwritten on the one session that's there. If I delete it and then login like normal, it sets the session to said user, but if I go back to the login and login as someone else the session is set to no one. I think this could be a logic error because I don't fully understand how to use sessions yet.
  - Actually, after reading a little about it, this overwrite behavior seems to be curbed by ignoring the sessions folder when starting the server, and now when I login as someone else the session is set to them instead of none! 
