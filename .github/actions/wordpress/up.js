const core = require( '@actions/core' );
const Docker = require( 'dockerode' );

async function run() {
	const docker = new Docker();

	console.log( core.getInput( 'dump' ) );
	console.log( JSON.stringify( core.getInput( 'wp-cli' ) ) );

	let authconfig = undefined;
	const username = core.getInput( 'username' );
	const password = core.getInput( 'password' );
	const serveraddress = core.getInput( 'registry' );
	if ( username && password && serveraddress ) {
		authconfig = {
			username,
			password,
			serveraddress,
		};
	}

	core.startGroup( 'Creating WordPress container' );
	const container = await docker.createContainer( {
		name: 'wordpress',
		authconfig,
		AttachStdout: true,
		AttachStderr: true,
		Image: core.getInput( 'image', { required: true } ),
		HostConfig: {
			NetworkMode: core.getInput( 'network', { required: true } ),
			PortBindings: {
				'9002/tcp': [ { HostPort: '80' } ],
			},
		},
	} );
	core.endGroup();

	core.startGroup( 'Starting WordPress container' );
	await container.start();
	core.endGroup();

	core.saveState( 'container_id', container.id );
	core.setOutput( 'id', container.id );
}

run().catch( ( e ) => {
	core.setFailed( e.message );
} );
