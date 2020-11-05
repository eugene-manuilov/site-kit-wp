/**
 * Data API - Cache related
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
import { cloneDeep } from 'lodash';

/**
 * Internal dependencies
 */
import { getStorage } from '../../util/storage';
import { stringifyObject } from '../../util/stringify';

export const STORAGE_KEY_PREFIX = 'googlesitekit_legacy_';

/**
 * Ensures that the local datacache object is properly set up.
 */
export const lazilySetupLocalCache = () => {
	global._googlesitekitLegacyData.admin = global._googlesitekitLegacyData.admin || {};

	if ( 'string' === typeof global._googlesitekitLegacyData.admin.datacache ) {
		global._googlesitekitLegacyData.admin.datacache = JSON.parse( global._googlesitekitLegacyData.admin.datacache );
	}

	if ( 'object' !== typeof global._googlesitekitLegacyData.admin.datacache ) {
		global._googlesitekitLegacyData.admin.datacache = {};
	}
};

/**
 * Sets data in the cache.
 *
 * @since 1.0.0
 *
 * @param {string} key  The cache key.
 * @param {Object} data The data to cache.
 */
export const setCache = ( key, data ) => {
	if ( 'undefined' === typeof data ) {
		return;
	}

	// Specific workaround to ensure no error responses are cached.
	if ( data && 'object' === typeof data && ( data.error || data.errors ) ) {
		return;
	}

	lazilySetupLocalCache();

	global._googlesitekitLegacyData.admin.datacache[ key ] = cloneDeep( data );

	const toStore = {
		value: data,
		date: Date.now() / 1000,
	};
	getStorage().setItem( STORAGE_KEY_PREFIX + key, JSON.stringify( toStore ) );
};

/**
 * Gets data from the cache.
 *
 * @since 1.0.0
 *
 * @param {string} key    The cache key.
 * @param {number} maxAge The cache TTL in seconds. If not provided, no TTL will be checked.
 * @return {(Object|undefined)} Cached data, or undefined if lookup failed.
 */
export const getCache = ( key, maxAge ) => {
	// Skip if js caching is disabled.
	if ( global._googlesitekitLegacyData.admin.nojscache ) {
		return undefined;
	}

	lazilySetupLocalCache();

	// Check variable cache first.
	if ( 'undefined' !== typeof global._googlesitekitLegacyData.admin.datacache[ key ] ) {
		return global._googlesitekitLegacyData.admin.datacache[ key ];
	}

	// Check persistent cache.
	const cache = JSON.parse( getStorage().getItem( STORAGE_KEY_PREFIX + key ) );
	if ( cache && 'object' === typeof cache && cache.date ) {
		// Only return value if no maximum age given or if cache age is less than the maximum.
		if ( ! maxAge || ( Date.now() / 1000 ) - cache.date < maxAge ) {
			// Set variable cache.
			global._googlesitekitLegacyData.admin.datacache[ key ] = cloneDeep( cache.value );

			return cloneDeep( global._googlesitekitLegacyData.admin.datacache[ key ] );
		}
	}

	return undefined;
};

/**
 * Removes data from the cache.
 *
 * @since 1.0.0
 *
 * @param {string} key The cache key.
 */
export const deleteCache = ( key ) => {
	lazilySetupLocalCache();

	delete global._googlesitekitLegacyData.admin.datacache[ key ];

	getStorage().removeItem( STORAGE_KEY_PREFIX + key );
};

/**
 * Returns a consistent cache key for the given arguments.
 *
 * @since 1.0.0
 *
 * @param {string}  type       The data type. Either 'core' or 'modules'.
 * @param {string}  identifier The data identifier, for example a module slug.
 * @param {string}  datapoint  The datapoint.
 * @param {Object?} data       Optional arguments to pass along.
 * @return {string} The cache key to use.
 */
export const getCacheKey = ( type, identifier, datapoint, data = null ) => {
	const key = [];
	const pieces = [ type, identifier, datapoint ];

	for ( const piece of pieces ) {
		if ( ! piece || ! piece.length ) {
			break;
		}
		key.push( piece );
	}

	if ( 3 === key.length && data && 'object' === typeof data && Object.keys( data ).length ) {
		key.push( stringifyObject( data ) );
	}

	return key.join( '::' );
};
