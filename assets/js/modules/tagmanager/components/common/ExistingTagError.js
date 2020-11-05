/**
 * Tag Manager Existing Tag Error component.
 *
 * Site Kit by Google, Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import Data from 'googlesitekit-data';
import { STORE_NAME } from '../../datastore/constants';
import ErrorText from '../../../../components/ErrorText';
const { useSelect } = Data;

export default function ExistingTagError() {
	const containerID = useSelect( ( select ) => select( STORE_NAME ).getExistingTag() );

	if ( ! containerID ) {
		return null;
	}

	const message = sprintf(
		/* translators: %s: container ID of the existing tag */
		__( 'We’ve detected there’s already an existing Tag Manager tag on your site (%s), but your account doesn’t seem to have the necessary access to this container. You can either remove the existing tag and connect to a different account, or request access to this container from your team.', 'google-site-kit' ),
		containerID
	);

	return <ErrorText message={ message } />;
}
