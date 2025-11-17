// ===== WEBSITE CACHE INVALIDATION =====
// Purpose: Invalidates Next.js website cache when stats are updated
// Dependencies: getSharedConfig() from SharedConfig.js
// Entry Point(s): invalidateWebsiteCache()

/**
 * Invalidates the Next.js website cache by calling the revalidate API endpoint.
 * Call this at the end of updateAll() in LeagueCore.js.
 *
 * This ensures users see fresh data within 1-2 seconds instead of waiting
 * up to 60 seconds for the cache to expire naturally.
 */
function invalidateWebsiteCache() {
  var config = getSharedConfig();
  var revalidateUrl = config.WEBSITE_REVALIDATE_URL;
  var secret = config.WEBSITE_REVALIDATE_SECRET;

  if (!revalidateUrl || revalidateUrl === '') {
    Logger.log('Website revalidation URL not configured, skipping cache invalidation');
    return;
  }

  if (!secret || secret === '') {
    Logger.log('WARNING: Website revalidation secret not configured, cache invalidation will fail');
    return;
  }

  try {
    // ===== Call Next.js revalidation API =====
    var payload = {
      secret: secret,
      tag: 'sheets' // Invalidates all data tagged with 'sheets' in Next.js
    };

    var options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    var response = UrlFetchApp.fetch(revalidateUrl, options);
    var responseCode = response.getResponseCode();
    var responseText = response.getContentText();

    if (responseCode === 200) {
      Logger.log('SUCCESS: Website cache invalidated');

      // Parse response to see what was revalidated
      try {
        var result = JSON.parse(responseText);
        if (result.revalidated) {
          Logger.log('Cache revalidated at: ' + result.timestamp);
        }
      } catch (e) {
        // Response might not be JSON, that's okay
      }
    } else if (responseCode === 401) {
      Logger.log('ERROR: Website revalidation failed - Invalid secret');
    } else {
      Logger.log('WARNING: Website revalidation returned code ' + responseCode + ': ' + responseText);
    }

  } catch (e) {
    Logger.log('ERROR: Failed to invalidate website cache: ' + e.toString());
  }
}

/**
 * Tests the website cache invalidation without actually invalidating.
 * Useful for debugging connection issues.
 *
 * @returns {object} Test result with status and message
 */
function testWebsiteCacheInvalidation() {
  var config = getSharedConfig();
  var revalidateUrl = config.WEBSITE_REVALIDATE_URL;
  var secret = config.WEBSITE_REVALIDATE_SECRET;

  var result = {
    configured: false,
    reachable: false,
    authenticated: false,
    message: ''
  };

  // Check if configured
  if (!revalidateUrl || revalidateUrl === '') {
    result.message = 'WEBSITE_REVALIDATE_URL not configured in Config sheet';
    return result;
  }

  if (!secret || secret === '') {
    result.message = 'WEBSITE_REVALIDATE_SECRET not configured in Config sheet';
    return result;
  }

  result.configured = true;

  try {
    // Test with correct secret
    var payload = {
      secret: secret,
      tag: 'sheets'
    };

    var options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    var response = UrlFetchApp.fetch(revalidateUrl, options);
    var responseCode = response.getResponseCode();

    result.reachable = true;

    if (responseCode === 200) {
      result.authenticated = true;
      result.message = 'SUCCESS: Cache invalidation endpoint is working correctly';
    } else if (responseCode === 401) {
      result.message = 'ERROR: Authentication failed - check WEBSITE_REVALIDATE_SECRET';
    } else {
      result.message = 'WARNING: Unexpected response code ' + responseCode;
    }

  } catch (e) {
    result.message = 'ERROR: Could not reach endpoint - ' + e.toString();
  }

  return result;
}

/**
 * Shows a dialog with the cache invalidation test results.
 * Accessible via menu.
 */
function showCacheInvalidationTest() {
  var result = testWebsiteCacheInvalidation();

  var message = '=== WEBSITE CACHE INVALIDATION TEST ===\n\n';
  message += 'Configured: ' + (result.configured ? '✅ Yes' : '❌ No') + '\n';
  message += 'Reachable: ' + (result.reachable ? '✅ Yes' : '❌ No') + '\n';
  message += 'Authenticated: ' + (result.authenticated ? '✅ Yes' : '❌ No') + '\n';
  message += '\n' + result.message;

  SpreadsheetApp.getUi().alert('Cache Invalidation Test', message, SpreadsheetApp.getUi().ButtonSet.OK);
}
