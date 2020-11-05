const core = require( '@actions/core' );
const Docker = require( 'dockerode' );

async function run() {
	const docker = new Docker();
	const Image = core.getInput( 'image', { required: true } );

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

	core.startGroup( 'Pulling WordPress image' );
	const stream = await docker.pull( Image, { authconfig } );
	await new Promise( ( resolve ) => {
		docker.modem.followProgress( stream, resolve, ( { id, status, progressDetail } ) => {
			const { current, total } = progressDetail || {};
			const progress = total ? ` - ${ Math.ceil( ( current || 0 ) * 100 / total ) }%` : '';
			console.log( `Pulling wpsnapshots image: [${ id }] ${ status }${ progress }` );
		} );
	} );
	core.endGroup();

	core.startGroup( 'Creating WordPress container' );
	const container = await docker.createContainer( {
		Image,
		name: 'wordpress',
		AttachStdout: true,
		AttachStderr: true,
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

	// const dump = core.getInput( 'dump' );
	// const wpCli = core.getInput( 'wp-cli' );
}

run().catch( ( e ) => {
	core.setFailed( e.message );
} );
