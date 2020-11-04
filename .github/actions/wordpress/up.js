const core = require( '@actions/core' );
const Docker = require( 'dockerode' );

try {
	const username = core.getInput( 'image-username' );
	const password = core.getInput( 'image-password' );

	// const docker = new Docker();

	// core.startGroup( 'Start WordPress container' );
	// docker.createContainer( {
	// 	name: 'wordpress',
	// 	Image: core.getInput( 'image', { required: true } ) + ':' + core.getInput( 'image-tag', { required: true } ),
	// 	ExposedPorts: {
	// 		9002: {

	// 		}
	// 	}
	// } );
	// core.endGroup();

	const container_id = '12345';

	core.saveState( 'container_id', container_id );
	core.setOutput( 'container_id', container_id );
} catch ( e ) {
	core.setFailed( e.message );
}
