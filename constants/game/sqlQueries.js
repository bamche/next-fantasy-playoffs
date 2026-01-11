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