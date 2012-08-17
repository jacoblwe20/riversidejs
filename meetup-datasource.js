/* Meetup Data
 * ==========================
 * @constutor   Meetup
 * @param       group   String - the groupname 
 */

var Meetup  = function(group){
    this.group      = group;
    this.url_base   = 'api.meetup.com';
    //Private Variable? - Sortof
    var key         = process.env.MEETUPKEY || '15865a185323203c58305f1a7b216c';
    // Privledged Function
    this.getKey     = function(){
        return key;
    }
},
    https    = require('https');

/* 
 * @method  convertTimer            - converts rime from epoch to utc
 * @param   epoch        Interger   - the actual epoch time
 */

Meetup.prototype.convertTime = function(epoch){

    // -28800000 is the utc offset to pacific standard time
    // adding a hour to offset to right time
    var d = new Date(epoch - 25200000), day, date, month, hour, minute, p, end, year, arr = [], time;
    //Time is a pain in the arse
    //To UTC
    d = (d !== null) ? d = d.toUTCString() : {};
    //Break everything apart
    d = d.split(' '); 
    // The day, I like periods better then commas
    day = d[0].replace(',', '.');
    // The numerial parse to remove leading 0
    date = parseFloat(d[1]);
    // The month shortname
    month = d[2];
    year = d[3];
    //Time array
    time = d[4].split(':');
    //parsefloat so we can compare to other number and calculate 
    hour = parseFloat(time[0]);
    minute = time[1];
    //We can push the date
    arr.push(day + ' ' + month + ' ' + date + ', ' + year + '<br>');
    //hour based off military time, switching that
    if(hour > 12){
      hour = hour - 12;
      p = 'PM';
    }
    else{
      p = 'AM';
    }
    // Compiling time
    time = hour + ':' + minute + ' ' + p;
    //making the default amount of time for the meetup 2 hours
    end = hour + 2 + ':' + minute + ' ' + p;
    //push the time
    arr.push(time + '-' + end + '<br>');
    //Return String
    return arr.join('');

}

/* 
 * @method  _request                - sends request to meetup.com's api 
 * @param   path        String      - the suffix of the url
 * @param   callback    Function    - callback function
 */

Meetup.prototype._request = function(path, callback){
    var options = {
        hostname: this.url_base,
        port    : 443,
        path    : path,
        method  : 'GET'
    },

    request = https.request(options, function(response){
        response.setEncoding('utf8');
        response.on('data', function(chunk){
            //console.log(JSON.stringify(chunk));
            var events = JSON.parse(chunk);
            callback(events.results);
        })
    });  

    request.on('error', function(error){
        //console.log(error);
        callback({statusCode: 500});
    });
    request.write('data\n');
    request.write('data\n');
    request.end();
}

/* 
 * @method  getEvents               - get events for meetup
 * @param   number      Interger    - number of events to get
 * @param   callback    Function    - callback function
 */

Meetup.prototype.getEvents = function(number, callback){
    var path = '/2/events';
    path += '?key='             + this.getKey();
    path += '&sign=true';
    path += '&group_urlname='   + this.group;
    path += '&page='            + number;

    this._request(path, callback);
    
}

exports.Meetup = Meetup;