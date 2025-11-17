// ===== DISCORD WEBHOOK NOTIFICATIONS =====
// Purpose: Posts automated notifications to Discord when stats are updated
// Dependencies: getSharedConfig() from SharedConfig.js
// Entry Point(s): notifyDiscordStatsUpdated(), postWeeklySchedule(), postGameResults()

/**
 * Posts a notification to Discord when UpdateAll completes.
 * Call this at the end of updateAll() in LeagueCore.js.
 *
 * @param {object} gameData - The processed game data object
 */
function notifyDiscordStatsUpdated(gameData) {
  var config = getSharedConfig();
  var webhookUrl = config.DISCORD_WEBHOOK_URL;

  if (!webhookUrl || webhookUrl === '') {
    Logger.log('Discord webhook not configured, skipping notification');
    return;
  }

  if (config.DISCORD_NOTIFY_GAMES !== true && config.DISCORD_NOTIFY_STANDINGS !== true) {
    Logger.log('Discord notifications disabled in config');
    return;
  }

  try {
    // ===== Build notification content =====

    var embeds = [];

    // Add game results embed
    if (config.DISCORD_NOTIFY_GAMES === true) {
      var gameResultsEmbed = buildGameResultsEmbed(gameData);
      if (gameResultsEmbed) {
        embeds.push(gameResultsEmbed);
      }
    }

    // Add standings embed
    if (config.DISCORD_NOTIFY_STANDINGS === true) {
      var standingsEmbed = buildStandingsEmbed();
      if (standingsEmbed) {
        embeds.push(standingsEmbed);
      }
    }

    if (embeds.length === 0) {
      Logger.log('No content to post to Discord');
      return;
    }

    // ===== Post to Discord =====
    var payload = {
      content: '📊 **League Hub Updated!**',
      embeds: embeds
    };

    var options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    var response = UrlFetchApp.fetch(webhookUrl, options);
    var responseCode = response.getResponseCode();

    if (responseCode === 200 || responseCode === 204) {
      Logger.log('SUCCESS: Discord notification sent');
    } else {
      Logger.log('WARNING: Discord webhook returned code ' + responseCode);
    }

  } catch (e) {
    Logger.log('ERROR: Failed to send Discord notification: ' + e.toString());
  }
}

/**
 * Builds an embed showing the latest game results.
 * @param {object} gameData - Game data object with gamesByWeek
 * @returns {object|null} Discord embed object or null if no games
 */
function buildGameResultsEmbed(gameData) {
  if (!gameData || !gameData.gamesByWeek) {
    return null;
  }

  // Get the most recent week with games
  var weeks = Object.keys(gameData.gamesByWeek).sort(function(a, b) {
    var weekA = parseInt(a.replace('Week ', ''));
    var weekB = parseInt(b.replace('Week ', ''));
    return weekB - weekA;
  });

  if (weeks.length === 0) {
    return null;
  }

  var latestWeek = weeks[0];
  var games = gameData.gamesByWeek[latestWeek];

  if (!games || games.length === 0) {
    return null;
  }

  // Build game results text (show last 3 games)
  var gamesToShow = games.slice(-3);
  var resultsText = '';

  for (var i = 0; i < gamesToShow.length; i++) {
    var game = gamesToShow[i];
    var emoji = game.winner === game.team1 ? '🏠' : '✈️';

    resultsText += emoji + ' **' + game.team2 + '** ' + game.runs2 + ' - ' + game.runs1 + ' **' + game.team1 + '**\n';
  }

  return {
    title: '📅 Latest Results - ' + latestWeek,
    description: resultsText,
    color: 0x00ff00,
    timestamp: new Date().toISOString()
  };
}

/**
 * Builds an embed showing current standings (top 4 teams).
 * @returns {object|null} Discord embed object or null if no standings
 */
function buildStandingsEmbed() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var standingsSheet = ss.getSheetByName('🥇 Standings');

    if (!standingsSheet) {
      return null;
    }

    // ===== P1: Read standings data ONCE =====
    // Assuming standings start at row 4, columns A-H
    var data = standingsSheet.getRange(4, 1, Math.min(4, standingsSheet.getLastRow() - 3), 8).getValues();

    if (data.length === 0) {
      return null;
    }

    // ===== P2: 0-based column indices =====
    var COLS = {
      RANK: 0,        // Column A
      TEAM: 1,        // Column B
      WINS: 2,        // Column C
      LOSSES: 3,      // Column D
      WIN_PCT: 4,     // Column E
      RUNS_SCORED: 5, // Column F
      RUNS_ALLOWED: 6,// Column G
      RUN_DIFF: 7     // Column H
    };

    var standingsText = '';

    for (var i = 0; i < data.length; i++) {
      var rank = data[i][COLS.RANK];
      var team = String(data[i][COLS.TEAM]).trim();
      var wins = data[i][COLS.WINS];
      var losses = data[i][COLS.LOSSES];

      if (!team) continue;

      var emoji = i === 0 ? '🥇' : (i === 1 ? '🥈' : (i === 2 ? '🥉' : ''));

      standingsText += emoji + ' **' + rank + '. ' + team + '** (' + wins + '-' + losses + ')\n';
    }

    return {
      title: '🏆 Current Standings',
      description: standingsText,
      color: 0x0099ff,
      footer: {
        text: 'View full stats at ' + (getConfigValue('WEBSITE_URL') || 'your website')
      }
    };

  } catch (e) {
    Logger.log('ERROR: Failed to build standings embed: ' + e.toString());
    return null;
  }
}

/**
 * Posts the weekly schedule to Discord.
 * Call this manually or via time-based trigger.
 *
 * @param {number} weekNumber - Week number to post
 */
function postWeeklySchedule(weekNumber) {
  var config = getSharedConfig();
  var webhookUrl = config.DISCORD_WEBHOOK_URL;

  if (!webhookUrl || webhookUrl === '') {
    Logger.log('Discord webhook not configured');
    return;
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var scheduleSheet = ss.getSheetByName('📅 Schedule');

    if (!scheduleSheet) {
      throw new Error('Schedule sheet not found');
    }

    // ===== P1: Read schedule data ONCE =====
    var data = scheduleSheet.getRange(2, 1, scheduleSheet.getLastRow() - 1, 3).getValues();

    // ===== P2: 0-based column indices =====
    var COLS = {
      WEEK: 0,      // Column A
      AWAY_TEAM: 1, // Column B
      HOME_TEAM: 2  // Column C
    };

    var matchups = [];

    for (var i = 0; i < data.length; i++) {
      var week = data[i][COLS.WEEK];
      var awayTeam = String(data[i][COLS.AWAY_TEAM]).trim();
      var homeTeam = String(data[i][COLS.HOME_TEAM]).trim();

      if (week === weekNumber && awayTeam && homeTeam) {
        matchups.push('🆚 **' + awayTeam + '** @ **' + homeTeam + '**');
      }
    }

    if (matchups.length === 0) {
      Logger.log('No matchups found for Week ' + weekNumber);
      return;
    }

    var payload = {
      embeds: [{
        title: '📅 Week ' + weekNumber + ' Schedule',
        description: matchups.join('\n'),
        color: 0x0099ff,
        footer: {
          text: 'Good luck to all teams!'
        }
      }]
    };

    var options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    var response = UrlFetchApp.fetch(webhookUrl, options);

    if (response.getResponseCode() === 200 || response.getResponseCode() === 204) {
      Logger.log('SUCCESS: Week ' + weekNumber + ' schedule posted to Discord');
    }

  } catch (e) {
    Logger.log('ERROR: Failed to post weekly schedule: ' + e.toString());
  }
}

/**
 * Posts a single game result to Discord.
 * Can be called after a game is scored.
 *
 * @param {string} awayTeam - Away team name
 * @param {string} homeTeam - Home team name
 * @param {number} awayRuns - Away team score
 * @param {number} homeRuns - Home team score
 * @param {string} mvp - Game MVP (optional)
 */
function postGameResult(awayTeam, homeTeam, awayRuns, homeRuns, mvp) {
  var config = getSharedConfig();
  var webhookUrl = config.DISCORD_WEBHOOK_URL;

  if (!webhookUrl || webhookUrl === '') {
    return;
  }

  var winner = homeRuns > awayRuns ? homeTeam : awayTeam;
  var emoji = winner === homeTeam ? '🏠' : '✈️';

  var description = emoji + ' **' + awayTeam + '** ' + awayRuns + ' - ' + homeRuns + ' **' + homeTeam + '**';

  if (mvp) {
    description += '\n⭐ **MVP:** ' + mvp;
  }

  var payload = {
    embeds: [{
      title: '⚾ Game Complete!',
      description: description,
      color: 0x00ff00,
      timestamp: new Date().toISOString()
    }]
  };

  try {
    var options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    UrlFetchApp.fetch(webhookUrl, options);
    Logger.log('Game result posted to Discord');
  } catch (e) {
    Logger.log('Failed to post game result: ' + e.toString());
  }
}
