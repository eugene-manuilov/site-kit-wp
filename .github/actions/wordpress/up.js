// @ts-check

const { EOL } = require( 'os' );
const { resolve } = require( 'path' );

const core = require( '@actions/core' );
const Docker = require( 'dockerode' );

async function pull( docker, image ) {
	const args = {};

	const username = core.getInput( 'username' );
	const password = core.getInput( 'password' );
	const serveraddress = core.getInput( 'registry' );
	if ( username && password && serveraddress ) {
		args.authconfig = {
			username,
			password,
			serveraddress,
		};
	}

	const stream = await docker.pull( image, args );
	await  new Promise( ( resolve ) => {
		docker.modem.followProgress( stream, resolve, ( event ) => {
			const { id, status, progress } = event;
			if ( id ) {
				if ( progress ) {
					core.info( `[${ id }] ${ status }: ${ progress }` );
				} else {
					core.info( `[${ id }] ${ status }` );
				}
			} else {
				core.info( status );
			}
		} );
	} );
}

async function start( docker, image ) {
	const container = await docker.createContainer( {
		Image: image,
		AttachStdin: false,
		AttachStdout: true,
		AttachStderr: true,
		HostConfig: {
			NetworkMode: core.getInput( 'network', { required: true } ),
			PortBindings: {
				'80/tcp': [
					{
						HostPort: '9002',
					},
				],
			},
			Binds: [
				`${ resolve( __dirname, '../../..' ) }:/var/www/html/wp-content/plugins/google-site-kit:ro`,
			],
		},
	} );

	await container.start();
	core.info( `Container ${ container.id } has been started.` );

	return container;
}

async function exec( container, command ) {
	const execArgs = {
		Cmd: command,
		AttachStdin: false,
		AttachStderr: true,
		AttachStdout: true,
		User: '33:33',
	};

	const exec = await container.exec( execArgs );
	const stream = await exec.start( {} );

	await new Promise( ( resolve ) => {
		container.modem.demuxStream( stream, process.stdout, process.stderr );
		stream.on( 'end', resolve );
	} );
}

async function run() {
	const docker = new Docker();
	const image = core.getInput( 'image', { required: true } );

	core.startGroup( 'Pulling WordPress image' );
	await pull( docker, image );
	core.endGroup();

	core.startGroup( 'Creating WordPress container' );
	const container = await start( docker, image );
	core.endGroup();

	core.saveState( 'container_id', container.id );
	core.setOutput( 'id', container.id );

	const dump = core.getInput( 'dump' );
	if ( dump ) {
		core.startGroup( 'Importing database dump' );
		await exec( container, [ 'wp', 'db', 'import', dump ] );
		core.endGroup();
	}

	const wpCli = core.getInput( 'wp-cli' );
	if ( wpCli ) {
		const commands = wpCli
			.trim()
			.split( EOL )
			.map( ( command ) => command.trim() )
			.filter( ( command ) => command.length > 0 );

		for ( const command of commands ) {
			core.startGroup( command );
			await exec( container, command.split( ' ' ) );
			core.endGroup();
		}
	}
}

run().catch( ( e ) => {
	core.setFailed( e.message );
} );
