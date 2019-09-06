const Thing = require( './Thing' );

/* CONSTANTS */
const BROKER = 'mqtts://a1tft8wvhqy4pm-ats.iot.us-east-1.amazonaws.com:8883';

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
  } catch ( e ){
    console.log( '..caught error:')
    console.error( e );
    process.exit( 1 );
  }
}

function wait( thing ){
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on('data', async () => {
    if( thing )
      await thing.disconnect();
    process.exit(0);
  });
}

/**
 * Log the given message to the console
 * @param {String} topic 
 * @param {Buffer} message 
 */
function logMessage( topic, message ){
  console.log( `..message received on topic: ${topic}` );
  console.log( message.toString())
  console.log( '' );
}

run()
  .catch( err => console.error( err ));