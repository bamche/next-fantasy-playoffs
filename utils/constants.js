export const SEASON_ID = '2024-2025-regular';
export const TEAM_LIST = 'buf,tb,kc,pit,phi,lar,hou,gb,det,bal,lac,min,den,was';
export const GAME_URL = 'https://api.mysportsfeeds.com/v2.1/pull/nfl/2025-playoff/games/';
export const PLAYERS_URL = 'https://api.mysportsfeeds.com/v2.1/pull/nfl/players.json';

export const positionList = 
['qb', 'rb1', 'rb2', 'wr1', 'wr2', 'te', 'flex1', 'flex2', 'flex3', 'flex4', 'k', 'dst'];

//name of individual defensive stats
export const defStatRecords = [
    'sack',
    'turnover',
    'block_ret',
    'sfty',
    'td',
    'pts_allowed'
  ];

//defensive stats point value, x is placeholder
export const defStatRecordPoints = [
    1, 2, 2, 5, 6, 'X'
  ];

//name of individual offensive stats
export const offStatRecords = ['pass_yd', 'pass_td', 'interception', 'rush_yd', 'rush_td',
'rec_yd', 'rec_td', 'rec', 'te_rec', 'two_pt', 'fg30', 'fg40', 'fg50', 'xtpm']

//individual value of stats
export const offStatRecordPoints  = {
  'pass_yd': 0.04,
  'pass_td': 4,
  'interception': -2,
  'rush_yd': 0.1,
  'rush_td': 6,
  'rec_yd': 0.1,
  'rec_td': 6,
  'rec': 1,
  'te_rec': 1.5,
  'two_pt': 2,
  'fg30': 3,
  'fg40': 4,
  'fg50': 5,
  'xtpm': 1
};


export const kickerStatRecordPoints = 
  {
    'fg30': 3,
    'fg40': 4,
    'fg50': 5,
    'xtpm': 1
  };


export const remainingDefQuery = `
  SELECT
    u.email,
    d.nfl_team
  FROM
    user_list u
  JOIN (
    SELECT
      nfl_team,
      def_id
    FROM def_list 
    WHERE def_id IN (
      SELECT dst
      FROM user_list
    )
    AND nfl_team IN (
      SELECT nfl_team
      FROM eliminated_teams
      WHERE eliminated = false
    )
    GROUP BY nfl_team, def_id
  ) d ON u.dst = d.def_id;`
  

export const remainingPlayerQuery = `
  SELECT
    u.email,
    total1, 
    total2, 
    total3,
    total4,
    grand_total,
    ARRAY_AGG(p.player_name) AS player_names
  FROM
    user_list u
  JOIN (
    SELECT
      player_id,
      player_name,
      nfl_team
    FROM player_list
    WHERE nfl_team IN (
      SELECT nfl_team
      FROM eliminated_teams
      WHERE eliminated = false
    )
    GROUP BY player_id, player_name, nfl_team, position
  ) p ON
      u.qb = p.player_id
      OR u.rb1 = p.player_id
      OR u.rb2 = p.player_id
      OR u.wr1 = p.player_id
      OR u.wr2 = p.player_id
      OR u.te = p.player_id
      OR u.flex1 = p.player_id
      OR u.flex2 = p.player_id
      OR u.flex3 = p.player_id
      OR u.flex4 = p.player_id
      OR u.k = p.player_id
      OR u.dst = p.player_id
  GROUP BY
    u.email;`;

export const updateUserListPointsQuery = (email) => {
  return `
    UPDATE user_list u
    SET
      total1 = subquery.total1,
      total2 = subquery.total2,
      total3 = subquery.total3,
      total4 = subquery.total4
    FROM (
      SELECT
        u.email,
        SUM(p.points1) AS total1,
        SUM(p.points2) AS total2,
        SUM(p.points3) AS total3,
        SUM(p.points4) AS total4
      FROM
        user_list u
      JOIN
        player_list p ON
          u.qb = p.player_id
          OR u.rb1 = p.player_id
          OR u.rb2 = p.player_id
          OR u.wr1 = p.player_id
          OR u.wr2 = p.player_id
          OR u.te = p.player_id
          OR u.flex1 = p.player_id
          OR u.flex2 = p.player_id
          OR u.flex3 = p.player_id
          OR u.flex4 = p.player_id
          OR u.k = p.player_id
      WHERE
        u.email = '${email}'
      GROUP BY
        u.email
    ) AS subquery
    WHERE u.email = subquery.email;`
}

export const updateUserDefPointsQuery = (email) => {
  return `
    UPDATE user_list u
    SET
      total1 = u.total1 + COALESCE(subquery.points1, 0),
      total2 = u.total2 + COALESCE(subquery.points2, 0),
      total3 = u.total3 + COALESCE(subquery.points3, 0),
      total4 = u.total4 + COALESCE(subquery.points4, 0)
    FROM (
      SELECT
        u.email,
        SUM(d.points1) AS points1,
        SUM(d.points2) AS points2,
        SUM(d.points3) AS points3,
        SUM(d.points4) AS points4
      FROM
        user_list u
      JOIN
        def_list d ON u.dst = d.def_id
      WHERE
        u.email = '${email}'
      GROUP BY
        u.email
    ) AS subquery
    WHERE u.email = subquery.email;`
}

export const TIME_CUT_OFF = '11 Jan 2025 21:31:00 GMT';

export const isLeagueStart = () => {
  const startTime = Date.parse(TIME_CUT_OFF); 
  const now = Date.now();
  return now > startTime
}