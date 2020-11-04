const core = require( '@actions/core' );

try {
	const image = core.getInput( 'image' );
	const imageTag = core.getInput( 'image-tag' );
	const username = core.getInput( 'image-username' );
	const password = core.getInput( 'image-password' );

	console.log( __dirname );
	console.log( image + ':' + imageTag );
	console.log( username );

	const container_id = '12345';

	core.saveState( 'container_id', container_id );
	core.setOutput( 'container_id', container_id );
} catch ( e ) {
	core.setFailed( e.message );
}
