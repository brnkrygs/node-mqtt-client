const Thing = require( './Thing' );

/* CONSTANTS */
const BROKER = 'mqtts://a1tft8wvhqy4pm-ats.iot.us-east-1.amazonaws.com:8883';

/**
 * Entry point
 */
async function run() {
  console.log( 'Running (Press any key to exit)...' );

  try {
    const connTestThing = new Thing( 'conn_test_1' );
    await connTestThing.connect( 
      BROKER, 
      'app/cert/AmazonRootCA1.pem.txt',
      'app/cert/575398e917-certificate.pem.crt',
      'app/cert/575398e917-private.pem.key'
    );

    await connTestThing.listenTo( connTestThing.shadow.get, logMessage );
    await connTestThing.listenTo( connTestThing.shadow.delta, logMessage );
    await connTestThing.listenTo( connTestThing.shadow.update, logMessage );

    console.log( '..waiting for messages\n--------' );

    wait( connTestThing );
  } catch( err ){
    console.error( 'Caught error:', err );
    process.exit( 1 );
  }
}

function wait( thing ){
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on('data', async () => {
    try{
      if( thing )
        await thing.disconnect();
      process.exit(0);
    } catch( err ){
      console.error( 'Caught error on shutdown:', err );
      process.exit(1);
    }
  });
}

/**
 * Log the given message to the console
 * @param {String} topic 
 * @param {Buffer} message 
 */
function logMessage( topic, message ){
  try{
    console.log( `..message received on topic: ${topic}` );
    console.log( message.toString())
    console.log( '' );
  } catch( err ){
    console.error( 'Caught error in logMessage():', err );
  }
}

// Start listener
run()
  .catch( err => console.error( err ));