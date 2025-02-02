const http = require( 'http' ),
      fs   = require( 'fs' ),
      mime = require( 'mime' ),
      dir  = 'public/',
      port = 3000

let appdata = []

const server = http.createServer( function( request,response ) {
  if( request.method === 'GET' ) {
    handleGet( request, response )    
  }else if( request.method === 'POST' ){
    handlePost( request, response ) 
  }
 })

const handleGet = function( request, response ) {
  const filename = dir + request.url.slice( 1 ) 

  if( request.url === '/' ) {
    sendFile( response, 'public/index.html' )
  }else{
    sendFile( response, filename )
  }
}

const handlePost = function( request, response ) {
  let dataString = ''

  request.on( 'data', function( data ) {
      dataString += data 
  })


  request.on( 'end', function() {

    if (request.url === "/submit") {
      let updatedDataset = calculateDueDate(dataString)
      let newItem = JSON.parse( updatedDataset ) 
      appdata.push( newItem )
      response.writeHead( 200, "OK", {'Content-Type': 'text/plain' })
      response.end(JSON.stringify(appdata))
    } else if (request.url === '/delete') {
      appdata.forEach( (item, i) => {
        if (JSON.stringify(item) == dataString) {
          appdata.splice(i, 1)
        }
      })
      response.writeHead( 200, "OK", {'Content-Type': 'text/plain' })
      response.end(JSON.stringify(appdata))
    }

  })
}

//server logic
function calculateDueDate (dataString) {
  let obj = JSON.parse(dataString)

   //creation of derived data field
   if (obj.priority == 'Yes') {
    obj.dueDate = '1 day'
  } else {
    obj.dueDate = '2 days'
  }

  return JSON.stringify(obj)
}

const sendFile = function( response, filename ) {
   const type = mime.getType( filename ) 

   fs.readFile( filename, function( err, content ) {

     // if the error = null, then we've loaded the file successfully
     if( err === null ) {

       // status code: https://httpstatuses.com
       response.writeHeader( 200, { 'Content-Type': type })
       response.end( content )

     }else{

       // file not found, error code 404
       response.writeHeader( 404 )
       response.end( '404 Error: File Not Found' )

     }
   })
}

server.listen( process.env.PORT || port )
