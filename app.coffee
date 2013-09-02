express     = require 'express'
gravatar    = require 'gravatar'
http        = require 'http'
fs          = require 'fs'
path        = require 'path'
meetup      = require('./meetup-datasource.js').Meetup
groupname   = 'riversidejs'
cron        = require('cron').CronJob;
group = new meetup(groupname)
PORT = process.env.PORT || 3000

# ==================================================
# EXPRESS APP SETUP
# ==================================================
app     = express()

# Start Storing Some Locals for App
# err not being passed to template update might be needed
# app.locals.title = groupname;

group.getGroupInfo (info) ->
  #make a fake locals object for now
  app.locals.info = info;

# ==================================================
# Cron Job to update group info
# ==================================================

job = new cron({
  cronTime: '00 30 11 * * 1-5'
  onTick: ->
    group.getGroupInfo (info) ->
      app.locals.info = info;
  start: false
  timeZone: "America/Los_Angeles"
});
job.start();

app.layout = "layout.jade";

app.configure ->
  app.set 'views', __dirname + "/views"
  app.set("view options", { layout: "layout.jade" });
  app.set('view engine', 'jade');
  app.use express.bodyParser();
  app.use express.logger('dev');
  app.use(express.bodyParser());
  app.use express.static(__dirname + "/public")
  app.use app.router;
  app.use require('connect-assets')()
  app.use ( req, res, next ) ->
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
    next();
  
# ==================================================
# EXPRESS ROUTES
# ==================================================
app.get '/', (req, res) -> 
  # need to set up middleware so we dont have to request new data every request
  group.getEvents 2, (events) ->
    #console.log(events);
    res.render 'index.jade', {events : events, info: app.locals.info}

app.get '/jobs', (req, res) ->
  res.send '<h1>Coming Soon!</h1>'


app.get '/events/:id', (req, res) ->
  res.redirect('http://meetup.com/' + groupname + '/events/' + req.params.id)

app.get '/api/v0/members.json', (req, res) ->
  group.getMembers (members) ->
    res.json({success: true, members: members});

app.get '/api/v0/events/:id.json', ( req, res ) ->
  console.log(res._headers);
  group.getEvent req.params.id, (event) ->
    res.json( event );


app.listen PORT, -> console.log "server is starting on port: #{PORT}"