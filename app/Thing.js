const mqtt = require( 'async-mqtt' );
const fs = require( 'fs' );

class Thing{
  constructor( thingName, client = null ){
    this.thingName = thingName;
    this.client = client || null;

    this.shadow = {
      get: `$aws/things/${this.thingName}/shadow/get/accepted`,
      delta: `$aws/things/${this.thingName}/shadow/update/delta`,
      update: `$aws/things/${this.thingName}/shadow/update/accepted`
    };
  }

  async connect( broker, caPath, certPath, keyPath ){
    const options = {
      clientId: this.thingName,
      ca: fs.readFileSync( caPath ),
      cert: fs.readFileSync( certPath),
      key: fs.readFileSync( keyPath )
    };

    this.client = await mqtt.connectAsync( broker, options );
    this.on( 'message', ( topic, message ) => this.handleMessage( topic, message ) );
    this.callbacks = { };
  }

  /**
   * Callback for when we receive a message from the broker
   * @param {String} topic 
   * @param {Buffer} message 
   */
  handleMessage( topic, message ){
    if( this.callbacks[topic] )
      this.callbacks[topic]( topic, message );
  }

  /**
   * Register a given Function to respond to messages on a given topic
   * @param {String} topic 
   * @param {Function} cb 
   */
  async listenTo( topic, cb ){
    this.callbacks[topic] = cb;
    await this.client.subscribe( topic );
  }

  async on( clientEvent, cb ){
    this.client.on( clientEvent, cb );
  }

  async disconnect(){
    if( this.client !== null )
      await this.client.end();
  }

  async subscribeToJobs(){

  }

  async publishTo( topic, message ){
    if( typeof( message ) !== 'string' )
      message = JSON.stringify( message );
    await this.client.publish( topic, message );
  }
}

module.exports = Thing;