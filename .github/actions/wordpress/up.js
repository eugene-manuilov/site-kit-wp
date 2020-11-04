const core = require( '@actions/core' );

try {
	const container_id = '12345';

	console.log( __dirname );

	core.saveState( 'container_id', container_id );
	core.setOutput( 'container_id', container_id );
} catch ( e ) {
	core.setFailed( e.message );
}
