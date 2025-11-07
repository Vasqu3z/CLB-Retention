/**
 * League configuration mapping to LeagueConfig.js
 * Uses 0-based indexing for consistency with main codebase
 * Add +1 when converting to Google Sheets column letters (A=1, B=2, etc.)
 */

export const SHEET_NAMES = {
  HITTING: '🧮 Hitting',
  PITCHING: '🧮 Pitching',
  FIELDING: '🧮 Fielding & Running',
  TEAM_DATA: 'Team Data',
  RANKINGS: '🏆 Rankings',
  PLAYER_DATA: 'Player Data',
  SEASON_SCHEDULE: 'Season Schedule',
  LEAGUE_SCHEDULE: '📅 League Schedule'
};

export const HITTING_COLUMNS = {
  PLAYER_NAME: 0,
  TEAM: 1,
  GP: 2,
  AB: 3,
  H: 4,
  HR: 5,
  RBI: 6,
  BB: 7,
  K: 8,
  ROB: 9,
  DP: 10,
  TB: 11,
  AVG: 12,
  OBP: 13,
  SLG: 14,
  OPS: 15
};

export const PITCHING_COLUMNS = {
  PLAYER_NAME: 0,
  TEAM: 1,
  GP: 2,
  W: 3,
  L: 4,
  SV: 5,
  ERA: 6,
  IP: 7,
  BF: 8,
  H: 9,
  HR: 10,
  R: 11,
  BB: 12,
  K: 13,
  BAA: 14,
  WHIP: 15
};

export const FIELDING_COLUMNS = {
  PLAYER_NAME: 0,
  TEAM: 1,
  GP: 2,
  NP: 3,
  E: 4,
  SB: 5
};

export const TEAM_STATS_COLUMNS = {
  TEAM_NAME: 0,
  CAPTAIN: 1,
  GP: 2,
  WINS: 3,
  LOSSES: 4,
  HITTING_START: 5,
  HITTING_NUM_COLS: 9,
  PITCHING_START: 14,
  PITCHING_NUM_COLS: 7,
  FIELDING_START: 21,
  FIELDING_NUM_COLS: 3
};

export const STAT_LABELS = {
  HITTING: {
    GP: 'Games Played',
    AB: 'At Bats',
    H: 'Hits',
    HR: 'Home Runs',
    RBI: 'RBI',
    BB: 'Walks',
    K: 'Strikeouts',
    ROB: 'Hits Robbed',
    DP: 'Double Plays',
    TB: 'Total Bases',
    AVG: 'Batting Average',
    OBP: 'On-Base %',
    SLG: 'Slugging %',
    OPS: 'OPS'
  },
  PITCHING: {
    GP: 'Games Played',
    W: 'Wins',
    L: 'Losses',
    SV: 'Saves',
    ERA: 'ERA',
    IP: 'Innings Pitched',
    BF: 'Batters Faced',
    H: 'Hits Allowed',
    HR: 'Home Runs Allowed',
    R: 'Runs Allowed',
    BB: 'Walks Allowed',
    K: 'Strikeouts',
    BAA: 'Batting Avg Against',
    WHIP: 'WHIP'
  },
  FIELDING: {
    GP: 'Games Played',
    NP: 'Nice Plays',
    E: 'Errors',
    SB: 'Stolen Bases'
  }
};

export const DATA_START_ROW = 2;
