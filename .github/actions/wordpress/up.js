const { EOL } = require( 'os' );

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
			console.log( `[${ id }] ${ status }${ progress }` );
		} );
	} );
	core.endGroup();

	core.startGroup( 'Creating WordPress container' );
	const container = await docker.createContainer( {
		Image,
		name: 'wordpress',
		AttachStdin: false,
		AttachStdout: true,
		AttachStderr: true,
		HostConfig: {
			NetworkMode: core.getInput( 'network', { required: true } ),
			PortBindings: {
				'9002/tcp': [ { HostPort: '80' } ],
			},
		},
	} );

	await container.start();
	core.endGroup();

	core.saveState( 'container_id', container.id );
	core.setOutput( 'id', container.id );

	const dump = core.getInput( 'dump' );
	if ( dump ) {
		core.startGroup( 'Importing database dump' );
		await container.exec( {
			Cmd: [ 'wp', 'db', 'import', dump ],
			AttachStdin: false,
			AttachStderr: true,
			AttachStdout: true,
			User: '33:33',
		} );
		core.endGroup();
	}

	const wpCli = core.getInput( 'wp-cli' );
	if ( wpCli ) {
		const commands = wpCli.split( EOL );
		for ( const command of commands ) {
			core.startGroup( command );
			await container.exec( {
				Cmd: command.split( ' ' ),
				AttachStdin: false,
				AttachStderr: true,
				AttachStdout: true,
				User: '33:33',
			} );
			core.endGroup();
		}
	}
}

run().catch( ( e ) => {
	core.setFailed( e.message );
} );
