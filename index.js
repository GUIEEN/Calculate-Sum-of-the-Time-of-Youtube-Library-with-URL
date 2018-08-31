const https = require('https');
const fs = require('fs');
const url = require('url');
// const http = require('http');

const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
let hour = 0,
  min = 0,
  sec = 0;

const urlOfYoutubeLibrary = readTextFile('./himitsu.txt').match(urlRegex)

async function run () {
  await Promise.all(urlOfYoutubeLibrary.map(async url => {
    let data = await get(url)
    let parsedResult = parsing(data, hour, min, sec)
    hour = parsedResult[0]
    min = parsedResult[1]
    sec = parsedResult[2]
  }))
  console.log(`Total video runtime is < ${hour}:${min}:${sec} >`)
}
run()


function parsing (data, hour, min, sec) {
  const regex = /timestamp"><span[^>]*>[0-9:]{2,6}/g

  data.match(regex).forEach(element => {
    t = element.match(/[0-9:]{4,6}/g)[0].split(/:/)
    min += parseInt(t[0], 10)
    sec += parseInt(t[1], 10)
  })

  if (sec / 60 > 1) min += Math.floor(sec / 60); sec = sec % 60
  if (min / 60 > 1) hour += Math.floor(min / 60); min = min % 60

  return [hour, min, sec]
}

function readTextFile(txtFile) {
  let str = fs.readFileSync(txtFile, 'utf8');
  return str
}

function get(url) {
  return _makeRequest('GET', url);
}

function _makeRequest(method, urlString, options) {

  // create a new Promise
  return new Promise((resolve, reject) => {

    /* Node's URL library allows us to create a
      * URL object from our request string, so we can build
      * our request for http.get */
    const parsedUrl = url.parse(urlString);
    console.log('urlString', urlString)
    // const requestOptions = _createOptions(method, parsedUrl);
    // console.log('requestOptions', requestOptions)
    const request = https.get(urlString, res => _onResponse(res, resolve, reject));

    /* if there's an error, then reject the Promise
      * (can be handled with Promise.prototype.catch) */
    request.on('error', reject);

    request.end();
  });
}

// the options that are required by http.get
function _createOptions(method, url) {
  return requestOptions = {
    hostname: url.hostname,
    path: url.path,
    port: url.port,
    method
  };
}

/* once http.get returns a response, build it and 
  * resolve or reject the Promise */
function _onResponse(response, resolve, reject) {
  const hasResponseFailed = response.status >= 400;
  var responseBody = '';

  if (hasResponseFailed) {
    reject(`Request to ${response.url} failed with HTTP ${response.status}`);
  }

  /* the response stream's (an instance of Stream) current data. See:
    * https://nodejs.org/api/stream.html#stream_event_data */
  response.on('data', chunk => {
    responseBody += chunk.toString()
  });

  // once all the data has been read, resolve the Promise 
  response.on('end', () => {
    return resolve(responseBody)
  });
}


// async function parsingLibraryURL(url, hour, min, sec) {
//   https.get(url, (resp) => {
//     let data = '';
//     // A chunk of data has been recieved.
//     resp.on('data', (chunk) => {
//       // console.log(chunk)
//       /**
//        ------------------ chunk of data ------------------
//         <Buffer 65 6e 74 2e 67 65 74 45 6c 65 6d 65 6e 74 42 79 49 64 29 69 66 28 22 75 6e 64 65 66 69 6e 65 64 22 21 3d 74 79 70 65 6f 66 20 58 4d 4c 48 74 74 70 52 ... >
//         <Buffer 72 69 70 74 20 6e 6f 6e 63 65 3d 22 42 61 37 6b 6b 56 63 6f 36 46 54 37 6a 5a 75 75 47 79 63 7a 48 67 3d 3d 22 3e 28 66 75 6e 63 74 69 6f 6e 28 29 7b ... >
//         <Buffer 65 2e 63 6f 6d 22 2c 22 69 73 62 68 22 3a 32 38 2c 22 6a 73 6f 6e 70 22 3a 74 72 75 65 2c 22 6d 73 67 73 22 3a 7b 22 63 69 62 6c 22 3a 22 26 23 32 36 ... >
//        */
//       data += chunk;
//     });
//     // The whole response has been received. Print out the result.
//     resp.on('end', () => {
//       const regex = /timestamp"><span[^>]*>[0-9:]{2,6}/g


//       data.match(regex).forEach(element => {
//         t = element.match(/[0-9:]{4,6}/g)[0].split(/:/)
//         min += parseInt(t[0], 10)
//         sec += parseInt(t[1], 10)
//       })


//       if (sec / 60 > 1) min += Math.floor(sec / 60); sec = sec % 60
//       if (min / 60 > 1) hour += Math.floor(min / 60); min = min % 60

//       // console.log(`Total video runtime is < ${hour}:${min}:${sec} >`)
//     });
//     return new Promise(resolve => {
//       resolve([hour, min, sec])
//     })

//   }).on("error", (err) => {
//     console.log("Error: " + err.message);
//   });
// }