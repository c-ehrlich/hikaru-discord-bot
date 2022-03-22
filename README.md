stuff to write about:
- i decided to restrict each instance of the bot to one server and put the configuration in the .env because that makes it MUCH easier for the server admin, compared to making the bot generic but having to do a bunch of initial setup
- my opinion: make it generic once you need (at least) two of them, NOT when you just need one


- register bot
- create a mongodb (for example on atlas), get uri
- deploy bot to heroku
- set config vars (see sample.env)
- generate bot link (it needs TKTK)
- invite to server
// no longre need to do this i think because its in the postdeploy script
- heroku run node src/deploy-commands.js
- restart dyno