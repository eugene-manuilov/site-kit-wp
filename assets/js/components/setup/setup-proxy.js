/**
 * Setup component.
 *
 * Site Kit by Google, Copyright 2019 Google LLC
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
import punycode from 'punycode';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { Fragment, useCallback } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { getQueryArg } from '@wordpress/url';

/**
 * Internal dependencies
 */
import Data from 'googlesitekit-data';
import PersonWalking from '../../../svg/person-walking.svg';
import { trackEvent } from '../../util';
import Header from '../Header';
import Button from '../button';
import ResetButton from '../reset-button';
import Layout from '../layout/layout';
import Notification from '../notifications/notification';
import OptIn from '../optin';
import CompatibilityChecks from './compatibility-checks';
import { STORE_NAME as CORE_SITE } from '../../googlesitekit/datastore/site/constants';
import { STORE_NAME as CORE_USER, DISCONNECTED_REASON_CONNECTED_URL_MISMATCH } from '../../googlesitekit/datastore/user/constants';
const { useSelect } = Data;

function SetupUsingProxy() {
	const {
		isSecondAdmin,
		isResettable,
		siteURL,
		proxySetupURL,
		disconnectedReason,
	} = useSelect( ( select ) => {
		const site = select( CORE_SITE );
		const user = select( CORE_USER );

		return {
			isSecondAdmin: site.hasConnectedAdmins(),
			isResettable: site.isResettable(),
			siteURL: site.getReferenceSiteURL(),
			proxySetupURL: site.getProxySetupURL(),
			disconnectedReason: user.getDisconnectedReason(),
		};
	} );

	const onButtonClick = useCallback( async ( event ) => {
		event.preventDefault();
		await trackEvent( 'plugin_setup', 'proxy_start_setup_landing_page' );
		global.location.assign( proxySetupURL );
	}, [ proxySetupURL ] );

	// @TODO: this needs to be migrated to the core/site datastore in the future
	const { errorMessage } = global._googlesitekitLegacyData.setup;

	let title;
	let description;

	if ( 'revoked' === getQueryArg( location.href, 'googlesitekit_context' ) ) {
		title = sprintf(
			/* translators: %s is the site's hostname. (e.g. example.com) */
			__( 'You revoked access to Site Kit for %s', 'google-site-kit' ),
			punycode.toUnicode( ( new URL( siteURL ) ).hostname )
		);
		description = __( 'Site Kit will no longer have access to your account. If you’d like to reconnect Site Kit, click "Sign in with Google" below to generate new credentials.', 'google-site-kit' );
	} else if ( isSecondAdmin ) {
		title = __( 'Connect your Google account to Site Kit', 'google-site-kit' );
		description = __( 'Site Kit has already been configured by another admin of this site. To use Site Kit as well, sign in with your Google account which has access to Google services for this site (e.g. Google Analytics). Once you complete the 3 setup steps, you’ll see stats from all activated Google products.', 'google-site-kit' );
	} else if ( DISCONNECTED_REASON_CONNECTED_URL_MISMATCH === disconnectedReason ) {
		title = __( 'Reconnect Site Kit', 'google-site-kit' );
		description = __( `Looks like the URL of your site has changed. In order to continue using Site Kit, you'll need to reconnect, so that your plugin settings are updated with the new URL.`, 'google-site-kit' );
	} else {
		title = __( 'Set up Site Kit', 'google-site-kit' );
		description = __( 'Get insights about how people find and use your site, how to improve and monetize your content, directly in your WordPress dashboard', 'google-site-kit' );
	}

	return (
		<Fragment>
			<Header />
			{ errorMessage && (
				<Notification
					id="setup_error"
					type="win-error"
					title={ __( 'Oops! There was a problem during set up. Please try again.', 'google-site-kit' ) }
					description={ errorMessage }
					isDismissable={ false }
				/>
			) }
			{ getQueryArg( location.href, 'notification' ) === 'reset_success' && (
				<Notification
					id="reset_success"
					title={ __( 'Site Kit by Google was successfully reset.', 'google-site-kit' ) }
					isDismissable={ false }
				/>
			) }
			<div className="googlesitekit-wizard">
				<div className="mdc-layout-grid">
					<div className="mdc-layout-grid__inner">
						<div className="mdc-layout-grid__cell mdc-layout-grid__cell--span-12">
							<Layout>
								<section className="googlesitekit-wizard-progress">
									<div className="googlesitekit-setup__footer">
										<div className="mdc-layout-grid">
											<div className={ classnames(
												'mdc-layout-grid__inner',
												{
													'googlesitekit-setup__content': featureFlags.userInput.enabled,
												}
											) }>
												{ featureFlags.userInput.enabled && (
													<div
														className="
															googlesitekit-setup__icon
															mdc-layout-grid__cell
															mdc-layout-grid__cell--span-12-tablet
															mdc-layout-grid__cell--span-6-desktop
														"
													>
														<PersonWalking width="570" height="337" />
													</div>
												) }

												<div
													className={ classnames(
														'mdc-layout-grid__cell',
														'mdc-layout-grid__cell--span-12-tablet',
														{
															'mdc-layout-grid__cell--span-6-desktop': featureFlags.userInput.enabled,
															'mdc-layout-grid__cell--span-12-desktop': ! featureFlags.userInput.enabled,
														}
													) }
												>
													<h1 className="googlesitekit-setup__title">
														{ title }
													</h1>

													<p className="googlesitekit-setup__description">
														{ description }
													</p>

													<CompatibilityChecks>
														{ ( { complete, inProgressFeedback, CTAFeedback } ) => (
															<Fragment>
																{ CTAFeedback }

																<OptIn optinAction="analytics_optin_setup_fallback" />

																<div className="googlesitekit-start-setup-wrap">
																	<Button
																		className="googlesitekit-start-setup"
																		href={ proxySetupURL }
																		onClick={ onButtonClick }
																		disabled={ ! complete }
																	>
																		{ __( 'Sign in with Google', 'google-site-kit' ) }
																	</Button>
																	{ inProgressFeedback }
																	{ ! isSecondAdmin && isResettable && <ResetButton /> }
																</div>
															</Fragment>
														) }
													</CompatibilityChecks>
												</div>
											</div>
										</div>
									</div>
								</section>
							</Layout>
						</div>
					</div>
				</div>
			</div>
		</Fragment>
	);
}

export default SetupUsingProxy;
