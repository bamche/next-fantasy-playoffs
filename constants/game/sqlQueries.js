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
  -- Calculate total points for all players (including eliminated)
  SELECT 
    ul.email,
    COALESCE(SUM(COALESCE(pl.points1, 0) + COALESCE(pl.points2, 0) + COALESCE(pl.points3, 0) + COALESCE(pl.points4, 0)), 0) +
    COALESCE(SUM(COALESCE(dl.points1, 0) + COALESCE(dl.points2, 0) + COALESCE(dl.points3, 0) + COALESCE(dl.points4, 0)), 0) AS total_points
  FROM public.user_list ul
  LEFT JOIN public.player_list pl ON pl.player_id IN (ul.qb, ul.rb1, ul.rb2, ul.wr1, ul.wr2, ul.te, ul.flex1, ul.flex2, ul.flex3, ul.flex4, ul.k)
  LEFT JOIN public.def_list dl ON ul.dst = dl.def_id
  GROUP BY ul.email
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

export const detailedLeagueViewQuery = `WITH offense_points AS (
  SELECT 
    u.email,
    COALESCE(SUM(COALESCE(p.points1, 0)), 0) AS off_week1,
    COALESCE(SUM(COALESCE(p.points2, 0)), 0) AS off_week2,
    COALESCE(SUM(COALESCE(p.points3, 0)), 0) AS off_week3,
    COALESCE(SUM(COALESCE(p.points4, 0)), 0) AS off_week4
  FROM public.user_list u
  LEFT JOIN public.player_list p ON p.player_id IN (
    u.qb, u.rb1, u.rb2, u.wr1, u.wr2, u.te, u.flex1, u.flex2, u.flex3, u.flex4, u.k
  )
  GROUP BY u.email
),
defense_points AS (
  SELECT 
    u.email,
    COALESCE(d.points1, 0) AS def_week1,
    COALESCE(d.points2, 0) AS def_week2,
    COALESCE(d.points3, 0) AS def_week3,
    COALESCE(d.points4, 0) AS def_week4,
    d.nfl_team AS dst
  FROM public.user_list u
  LEFT JOIN public.def_list d ON u.dst = d.def_id
),
player_names AS (
  SELECT 
    u.email,
    MAX(CASE WHEN p.player_id = u.qb THEN p.player_name END) AS qb,
    MAX(CASE WHEN p.player_id = u.rb1 THEN p.player_name END) AS rb1,
    MAX(CASE WHEN p.player_id = u.rb2 THEN p.player_name END) AS rb2,
    MAX(CASE WHEN p.player_id = u.wr1 THEN p.player_name END) AS wr1,
    MAX(CASE WHEN p.player_id = u.wr2 THEN p.player_name END) AS wr2,
    MAX(CASE WHEN p.player_id = u.te THEN p.player_name END) AS te,
    MAX(CASE WHEN p.player_id = u.flex1 THEN p.player_name END) AS flex1,
    MAX(CASE WHEN p.player_id = u.flex2 THEN p.player_name END) AS flex2,
    MAX(CASE WHEN p.player_id = u.flex3 THEN p.player_name END) AS flex3,
    MAX(CASE WHEN p.player_id = u.flex4 THEN p.player_name END) AS flex4,
    MAX(CASE WHEN p.player_id = u.k THEN p.player_name END) AS k
  FROM public.user_list u
  LEFT JOIN public.player_list p ON p.player_id IN (
    u.qb, u.rb1, u.rb2, u.wr1, u.wr2, u.te, u.flex1, u.flex2, u.flex3, u.flex4, u.k
  )
  GROUP BY u.email
)
SELECT 
  ROUND(COALESCE(op.off_week1, 0) + COALESCE(dp.def_week1, 0), 2) AS week1,
  ROUND(COALESCE(op.off_week2, 0) + COALESCE(dp.def_week2, 0), 2) AS week2,
  ROUND(COALESCE(op.off_week3, 0) + COALESCE(dp.def_week3, 0), 2) AS week3,
  ROUND(COALESCE(op.off_week4, 0) + COALESCE(dp.def_week4, 0), 2) AS week4,
  ROW_NUMBER() OVER (ORDER BY u.email) - 1 AS id,
  u.email,
  COALESCE(dp.dst, '') AS dst,
  COALESCE(pn.qb, '') AS qb,
  COALESCE(pn.rb1, '') AS rb1,
  COALESCE(pn.rb2, '') AS rb2,
  COALESCE(pn.wr1, '') AS wr1,
  COALESCE(pn.wr2, '') AS wr2,
  COALESCE(pn.te, '') AS te,
  COALESCE(pn.flex1, '') AS flex1,
  COALESCE(pn.flex2, '') AS flex2,
  COALESCE(pn.flex3, '') AS flex3,
  COALESCE(pn.flex4, '') AS flex4,
  COALESCE(pn.k, '') AS k,
  ROUND(
    COALESCE(op.off_week1, 0) + COALESCE(dp.def_week1, 0) +
    COALESCE(op.off_week2, 0) + COALESCE(dp.def_week2, 0) +
    COALESCE(op.off_week3, 0) + COALESCE(dp.def_week3, 0) +
    COALESCE(op.off_week4, 0) + COALESCE(dp.def_week4, 0),
    2
  ) AS total
FROM public.user_list u
LEFT JOIN offense_points op ON u.email = op.email
LEFT JOIN defense_points dp ON u.email = dp.email
LEFT JOIN player_names pn ON u.email = pn.email
ORDER BY u.email;`;