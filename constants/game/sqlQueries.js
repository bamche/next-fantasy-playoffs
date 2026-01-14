export const leaderBoardQuery = `
WITH all_team_players AS (
  -- Collect all players from player_list positions (non-eliminated only)
  SELECT 
    ul.email,
    pl.player_name AS name,
    pl.position,
    nfl.abbreviation,
    nfl.color,
    nfl.alternate_color
  FROM public.user_list ul
  INNER JOIN public.player_list pl ON (
    pl.player_id IN (ul.qb, ul.rb1, ul.rb2, ul.wr1, ul.wr2, ul.te, ul.flex1, ul.flex2, ul.flex3, ul.flex4, ul.k)
    AND pl.eliminated = false
  )
  LEFT JOIN public.all_nfl_teams nfl ON pl.nfl_team = nfl.id
  
  UNION ALL
  
  -- Collect non-eliminated DST from def_list
  SELECT 
    ul.email,
    dl.nfl_team AS name,
    'DST' AS position,
    nfl.abbreviation,
    nfl.color,
    nfl.alternate_color
  FROM public.user_list ul
  INNER JOIN public.def_list dl ON ul.dst = dl.def_id AND dl.eliminated = false
  LEFT JOIN public.all_nfl_teams nfl ON dl.nfl_team = nfl.abbreviation
),
total_points_calc AS (
  -- Calculate total points from weekly totals
  SELECT 
    ul.email,
    COALESCE(ul.total1, 0) + COALESCE(ul.total2, 0) + COALESCE(ul.total3, 0) + COALESCE(ul.total4, 0) AS total_points
  FROM public.user_list ul
)
SELECT 
  ul.email,
  COALESCE(tp.total_points, 0) AS total_points,
  COALESCE(
    ARRAY_AGG(
      json_build_object(
        'name', atp.name,
        'abbreviation', atp.abbreviation,
        'position', atp.position,
        'color', atp.color,
        'alternateColor', atp.alternate_color
      )
      ORDER BY atp.position desc, atp.name desc
    ) FILTER (WHERE atp.name IS NOT NULL),
    ARRAY[]::json[]
  ) AS remaining_players
FROM public.user_list ul
LEFT JOIN total_points_calc tp ON ul.email = tp.email
LEFT JOIN all_team_players atp ON ul.email = atp.email
GROUP BY ul.email, tp.total_points
ORDER BY tp.total_points DESC;
`;


// Single SQL query for teamView
// Takes email parameter and returns player stats grouped by playerId with total_score
export const teamViewQuery = 
`WITH user_players AS (
  SELECT 
    email,
    qb, rb1, rb2, wr1, wr2, te, flex1, flex2, flex3, flex4, k, dst
  FROM public.user_list
  WHERE email = $1
),
all_player_ids AS (
  SELECT DISTINCT player_id
  FROM (
    SELECT qb AS player_id FROM user_players
    UNION ALL SELECT rb1 FROM user_players
    UNION ALL SELECT rb2 FROM user_players
    UNION ALL SELECT wr1 FROM user_players
    UNION ALL SELECT wr2 FROM user_players
    UNION ALL SELECT te FROM user_players
    UNION ALL SELECT flex1 FROM user_players
    UNION ALL SELECT flex2 FROM user_players
    UNION ALL SELECT flex3 FROM user_players
    UNION ALL SELECT flex4 FROM user_players
    UNION ALL SELECT k FROM user_players
  ) AS ids
  WHERE player_id IS NOT NULL
),
player_stats AS (
  SELECT 
    p.player_id,
    p.player_name AS name,
    p.position,
    nfl.abbreviation AS team,
    COALESCE(p.points1, 0) AS points1,
    COALESCE(p.points2, 0) AS points2,
    COALESCE(p.points3, 0) AS points3,
    COALESCE(p.points4, 0) AS points4,
    COALESCE(p.points1, 0) + COALESCE(p.points2, 0) + COALESCE(p.points3, 0) + COALESCE(p.points4, 0) AS total_score
  FROM all_player_ids api
  INNER JOIN public.player_list p ON api.player_id = p.player_id
  INNER JOIN public.all_nfl_teams nfl ON p.nfl_team = nfl.id
),
defense_stats AS (
  SELECT 
    d.def_id AS player_id,
    CONCAT(d.nfl_team, ' - DST') AS name,
    'DST' AS position,
    d.nfl_team AS team,
    COALESCE(d.points1, 0) AS points1,
    COALESCE(d.points2, 0) AS points2,
    COALESCE(d.points3, 0) AS points3,
    COALESCE(d.points4, 0) AS points4,
    COALESCE(d.points1, 0) + COALESCE(d.points2, 0) + COALESCE(d.points3, 0) + COALESCE(d.points4, 0) AS total_score
  FROM user_players up
  INNER JOIN public.def_list d ON up.dst = d.def_id
  WHERE up.dst IS NOT NULL
),
all_stats AS (
  SELECT * FROM player_stats
  UNION ALL
  SELECT * FROM defense_stats
),
total_score_calc AS (
  SELECT SUM(total_score) AS total_score
  FROM all_stats
)
SELECT 
  json_build_object(
    'players', (
      SELECT json_agg(
        json_build_object(
          'id', player_id,
          'playerId', player_id,
          'name', name,
          'position', position,
          'team', team,
          'points1', points1,
          'points2', points2,
          'points3', points3,
          'points4', points4,
          'total_score', total_score
        )
        ORDER BY 
          CASE position
            WHEN 'QB' THEN 1
            WHEN 'RB' THEN 2
            WHEN 'WR' THEN 3
            WHEN 'TE' THEN 4
            WHEN 'K' THEN 5
            WHEN 'DST' THEN 6
            ELSE 7
          END,
          player_id
      )
      FROM all_stats
    ),
    'total_score', (SELECT total_score FROM total_score_calc)
  ) AS teamViewStats;
`;

// Insert a new notification
// Takes title ($1), message ($2), and type ($3) as parameters
// Returns the created notification with all fields
export const insertNotificationQuery = `
  INSERT INTO public.notifications (title, message, type)
  VALUES ($1, $2, $3)
  RETURNING notification_id, title, message, type, created_at;
`;