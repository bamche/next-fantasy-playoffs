export default function GetRemainingColumns(maxLength){

    const columns = [
        {
          field: 'grand_total',
          headerName: 'Total Score',
          width: 150,
        },
        { 
          field: 'email', 
          headerName: 'email', 
          width: 130 }
        
      ];
    const weekTotals = [
        {
            field: 'total1',
            headerName: 'Wild Card',
            width: 120,
          },
          {
            field: 'total2',
            headerName: 'Divisional',
            width: 120,
          },
          {
            field: 'total3',
            headerName: 'Conference',
            width: 120,
          },
          {
            field: 'total4',
            headerName: 'Super Bowl',
            width: 120,
          }
    ]
    for (let i = 0; i < maxLength; i++) {
        columns.push(
          {
            field: 'player' + i,
            headerName: 'Player',
            width: 120,
          }
        )
      }
      weekTotals.forEach((total )=>columns.push(total))
      return columns;
}


