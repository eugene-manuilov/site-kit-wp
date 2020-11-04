const core = require( '@actions/core' );
const Docker = require( 'dockerode' );

async function run() {
	const username = core.getInput( 'image-username' );
	const password = core.getInput( 'image-password' );

	const docker = new Docker();
	const container = await docker.createContainer( {
		name: 'wordpress',
		AttachStdout: true,
		AttachStderr: true,
		Image: core.getInput( 'image', { required: true } ) + ':' + core.getInput( 'image-tag', { required: true } ),
		HostConfig: {
			NetworkMode: core.getInput( 'image-network', { required: true } ),
			PortBindings: {
				'9002/tcp': [ { HostPort: '80' } ],
			},
		},
	} );

	core.startGroup( 'Starting WordPress container' );
	container.start();
	core.endGroup();

	core.saveState( 'container_id', container.id );
	core.setOutput( 'id', container.id );
}

run().catch( ( e ) => {
	core.setFailed( e.message );
} );
