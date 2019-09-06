/* LIBRARIES */
const mqtt = require("async-mqtt");
const fs = require( 'fs' );

/* CONSTANTS */
const BROKER = 'mqtts://a1tft8wvhqy4pm-ats.iot.us-east-1.amazonaws.com:8883';

async function run() {

  console.log( 'Running (Press any key to exit)...' );
  try {
    const options = {
      clientId: 'conn_test_1',
      ca: fs.readFileSync( 'app/cert/AmazonRootCA1.pem.txt' ),
      cert: fs.readFileSync( 'app/cert/575398e917-certificate.pem.crt' ),
      key: fs.readFileSync( 'app/cert/575398e917-private.pem.key' )
    };

    console.log( '..connecting' );
    const client = await mqtt.connectAsync( BROKER, options );
    console.log( '..connected' );

    client.on( 'message', handleShadow );

    console.log( '..subscribing' );
    await client.subscribe( '$aws/things/conn_test_1/shadow/get/accepted' );
    console.log( '..subscribed' );

    console.log( '..publishing' );
    await client.publish( '$aws/things/conn_test_1/shadow/get', JSON.stringify({}) );
    console.log( '..published' );

    console.log( '..waiting for messages' );

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', async () => {
      await finish(client);
      process.exit(0);
    });
  } catch ( e ){
    console.log( '..caught error:')
    console.error( e );
    console.log(e.stack);
    process.exit();
  }
}

async function finish( client ){
  console.log( '..disconnecting' );
  await client.end();
  console.log( '..disconnected' );
}

function handleShadow( topic, message ){
  // message is Buffer
  console.log( '..received message:' );
  console.log( `....on topic: ${topic}` );
  console.log( `....message:` );
  console.log( message.toString())
}

run()
  .catch( err => console.error( err ));