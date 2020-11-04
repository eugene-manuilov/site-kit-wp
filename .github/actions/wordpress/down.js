const core = require( '@actions/core' );

try {
} catch ( e ) {
	core.setFailed( e.message );
}
