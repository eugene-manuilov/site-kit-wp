const { EOL } = require( 'os' );

const core = require( '@actions/core' );
const Docker = require( 'dockerode' );

function followProgress( stream ) {
	return new Promise( ( resolve, reject ) => {
		docker.modem.followProgress( stream, ( error, output ) => {
			if ( error ) {
				reject( error );
			} else {
				if ( Array.isArray( output ) && output.length ) {
					output.forEach( console.log );
				}

				resolve();
			}
		} );
	} );
}

async function run() {
	const docker = new Docker();
	const Image = core.getInput( 'image', { required: true } );

	let stream;
	let authconfig;

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
	stream = await docker.pull( Image, { authconfig } );
	await followProgress( stream );
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

	stream = await container.start();
	await followProgress( stream );
	core.endGroup();

	core.saveState( 'container_id', container.id );
	core.setOutput( 'id', container.id );

	const dump = core.getInput( 'dump' );
	if ( dump ) {
		core.startGroup( 'Importing database dump' );
		stream = await container.exec( {
			Cmd: [ 'wp', 'db', 'import', dump ],
			AttachStdin: false,
			AttachStderr: true,
			AttachStdout: true,
			User: '33:33',
		} );
		await followProgress( stream );
		core.endGroup();
	}

	const wpCli = core.getInput( 'wp-cli' );
	if ( wpCli ) {
		const commands = wpCli.split( EOL );
		for ( const command of commands ) {
			core.startGroup( command );
			stream = await container.exec( {
				Cmd: command.split( ' ' ),
				AttachStdin: false,
				AttachStderr: true,
				AttachStdout: true,
				User: '33:33',
			} );
			await followProgress( stream );
			core.endGroup();
		}
	}
}

run().catch( ( e ) => {
	core.setFailed( e.message );
} );
