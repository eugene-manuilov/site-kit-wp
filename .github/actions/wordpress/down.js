const core = require( '@actions/core' );

try {
	const container_id = core.getState( 'container_id' );
	console.log( container_id );
} catch ( e ) {
	core.setFailed( e.message );
}
