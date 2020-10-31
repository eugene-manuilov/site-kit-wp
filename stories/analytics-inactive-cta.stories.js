/**
 * AnalyticsInactiveCTA Component Stories.
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
 * External dependencies
 */
import { storiesOf } from '@storybook/react';

/**
 * Internal dependencies
 */
import AnalyticsInactiveCTA from '../assets/js/components/AnalyticsInactiveCTA';
import {
	PERMISSION_MANAGE_OPTIONS,
	STORE_NAME as CORE_USER,
} from '../assets/js/googlesitekit/datastore/user/constants';
import { STORE_NAME as CORE_MODULES } from '../assets/js/googlesitekit/modules/datastore/constants';
import { WithTestRegistry } from '../tests/js/utils';

storiesOf( 'Global', module )
	.add( 'Analytics Inactive CTA', () => {
		const setupRegistry = ( { dispatch } ) => {
			dispatch( CORE_USER ).receiveCapabilities( {
				[ PERMISSION_MANAGE_OPTIONS ]: true,
			} );
			dispatch( CORE_MODULES ).receiveGetModules( [
				{
					slug: 'analytics',
				},
			] );
		};
		return (
			<WithTestRegistry callback={ setupRegistry }>
				<AnalyticsInactiveCTA />
			</WithTestRegistry>
		);
	} );
