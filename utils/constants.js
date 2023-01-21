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
export const offStatRecordPoints = [
    0.025, 4, -2, 0.1, 6,
    .1, 6, 1, 1.5, 2, 3, 4, 5, 1
];