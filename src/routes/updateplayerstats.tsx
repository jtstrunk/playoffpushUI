import React, { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';

type PlayerInfo = {
  playerid: number;
  name: string;
  position: string;
  team: keyof typeof nflTeamMap;
  points: number;
  wildcard: number;
  divisional: number;
  championship: number;
  superbowl: number;
};

type PlayoffTeams = Record<string, PlayerInfo[]>;

const nflTeamMap = {
  BUF: 'Buffalo Bills',
  CIN: 'Cincinnati Bengals',
  KC: 'Kansas City Chiefs',
  BAL: 'Baltimore Ravens',
  HOU: 'Houston Texans',
  LAC: 'Los Angeles Chargers',
  PIT: 'Pittsburgh Steelers',
  DET: 'Detroit Lions',
  PHI: 'Philadelphia Eagles',
  TB: 'Tampa Bay Buccaneers',
  LAR: 'Los Angeles Rams',
  MIN: 'Minnesota Vikings',
  WAS: 'Washington Commanders',
  GB: 'Green Bay Packers',
} as const;

const AFCteams = ['BUF', 'CIN', 'KC', 'BAL', 'HOU', 'LAC', 'PIT'] as const;
const NFCteams = ['DET', 'PHI', 'TB', 'LAR', 'MIN', 'WAS', 'GB'] as const;

type WeekProp = 'wildcard' | 'divisional' | 'championship' | 'superbowl';

const weekKeyMap: Record<string, WeekProp> = {
  'Wild Card': 'wildcard',
  Divisional: 'divisional',
  Championship: 'championship',
  'Super Bowl': 'superbowl',
};

const weeks = ['Wild Card', 'Divisional', 'Championship', 'Super Bowl'];

const initAFCplayoffTeams: PlayoffTeams = AFCteams.reduce((acc, abbr) => {
  acc[nflTeamMap[abbr]] = [];
  return acc;
}, {} as PlayoffTeams);

const initNFCplayoffTeams: PlayoffTeams = NFCteams.reduce((acc, abbr) => {
  acc[nflTeamMap[abbr]] = [];
  return acc;
}, {} as PlayoffTeams);

function isAFCTeam(team: string): team is typeof AFCteams[number] {
  return AFCteams.includes(team as typeof AFCteams[number]);
}

function isNFCTeam(team: string): team is typeof NFCteams[number] {
  return NFCteams.includes(team as typeof NFCteams[number]);
}

type ChangedPlayer = { playerid: number; week: WeekProp; points: number };

export const route = {
  component: function UpdatePlayerStats() {
    const [players, setPlayers] = useState<PlayerInfo[]>([]);
    const [weekShowing, setWeekShowing] = useState<string>('Wild Card');
    const [AFCplayoffTeams, setAfcPlayoffTeams] = useState<PlayoffTeams>(initAFCplayoffTeams);
    const [NFCplayoffTeams, setNfcPlayoffTeams] = useState<PlayoffTeams>(initNFCplayoffTeams);

    // New state to track changed players
    const [changedPlayers, setChangedPlayers] = useState<ChangedPlayer[]>([]);

    useEffect(() => {
      async function fetchPlayers() {
        try {
          const res = await fetch('http://localhost:3000/getdraftedplayers');
          if (!res.ok) throw new Error('Failed to fetch unique players');
          const data: PlayerInfo[] = await res.json();

          data.forEach((p) => {
            ['wildcard', 'divisional', 'championship', 'superbowl'].forEach((week) => {
              if (p[week as WeekProp] == null) p[week as WeekProp] = 0;
            });
          });

          setPlayers(data);

          const newAFC: PlayoffTeams = { ...initAFCplayoffTeams };
          const newNFC: PlayoffTeams = { ...initNFCplayoffTeams };

          data.forEach((p) => {
            const fullname = nflTeamMap[p.team];
            if (isAFCTeam(p.team)) {
              newAFC[fullname] = [...(newAFC[fullname] || []), p];
            } else if (isNFCTeam(p.team)) {
              newNFC[fullname] = [...(newNFC[fullname] || []), p];
            } else {
              console.warn(`Unknown team code: ${p.team}`);
            }
          });

          setAfcPlayoffTeams(newAFC);
          setNfcPlayoffTeams(newNFC);
        } catch (err) {
          console.error(err);
        }
      }
      fetchPlayers();
    }, []);

    function updatePlayerInPlayoffTeams(playerId: number, weekKey: WeekProp, newValue: string) {
      const numericValue = parseFloat(newValue);
      if (isNaN(numericValue)) return;

      setPlayers((prevPlayers) =>
        prevPlayers.map((p) => (p.playerid === playerId ? { ...p, [weekKey]: numericValue } : p))
      );

      setAfcPlayoffTeams((prevTeams) => {
        const updated: PlayoffTeams = {};
        for (const teamName in prevTeams) {
          updated[teamName] = prevTeams[teamName].map((p) =>
            p.playerid === playerId ? { ...p, [weekKey]: numericValue } : p
          );
        }
        return updated;
      });

      setNfcPlayoffTeams((prevTeams) => {
        const updated: PlayoffTeams = {};
        for (const teamName in prevTeams) {
          updated[teamName] = prevTeams[teamName].map((p) =>
            p.playerid === playerId ? { ...p, [weekKey]: numericValue } : p
          );
        }
        return updated;
      });

      // Track changes here
      setChangedPlayers((prev) => {
        // Remove existing entry for this player/week if any, then add new
        const others = prev.filter(
          (item) => !(item.playerid === playerId && item.week === weekKey)
        );
        
        const playerName = players.find((p) => p.playerid === playerId)?.name ?? '';
        return [...others, { playerid: playerId, week: weekKey, points: numericValue, name: playerName }];
      });

      console.log(`Updated player ${playerId} ${weekKey} to value:`, numericValue);
    }

    function navigateRight() {
      const idx = weeks.indexOf(weekShowing);
      if (idx < weeks.length - 1) setWeekShowing(weeks[idx + 1]);
    }
    function navigateLeft() {
      const idx = weeks.indexOf(weekShowing);
      if (idx > 0) setWeekShowing(weeks[idx - 1]);
    }

    const currentWeekKey = weekKeyMap[weekShowing];

    function submitChangedPlayers() {
        console.log(changedPlayers)
        fetch('http://localhost:3000/updateplayerstats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(changedPlayers),
        })
        .then((res) => {
        if (!res.ok) throw new Error('Failed to update player points');
        return res.json();
        })
        .then((data) => {
        console.log('Update response:', data);
        // optionally clear the changedPlayers after successful update
        setChangedPlayers([]);
        })
        .catch((error) => {
        console.error('Error updating player points:', error);
        });
    }


    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <button onClick={submitChangedPlayers} style={{ marginBottom: 20 }}>Submit Changed Players</button>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: 300,
            marginBottom: 20,
          }}
        >
          <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '800px'}}>
              <img src='src/assets/left-arrow.png' onClick={() => navigateLeft()} style={{width: '22px', height: '20px', marginTop: '5px', marginLeft: '40px'}}></img>
              <p style={{fontSize: '24px'}}>{weekShowing}</p>
              <img src='src/assets/right-arrow.png' onClick={() => navigateRight()} style={{width: '22px', height: '20px', marginTop: '5px'}}></img>
            </div>
        </div>
        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-around' }}>
          <div>
            <h1>AFC TEAMS</h1>
            {Object.entries(AFCplayoffTeams).map(([teamName, players]) => (
              <div key={teamName} style={{ borderRadius: 5, margin: '10px 5px', padding: 5 }}>
                <h3>{teamName}</h3>
                {players.map((player) => {
                  const weekValue = player[currentWeekKey] ?? 0;
                  return (
                    <div
                      key={player.playerid}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: 300,
                        marginBottom: 5,
                      }}
                    >
                      <div>{player.name}</div>
                      <input
                        type="number"
                        value={weekValue.toFixed(2)}
                        style={{ fontSize: 18, width: 80 }}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          updatePlayerInPlayoffTeams(player.playerid, currentWeekKey, e.target.value)
                        }
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <div>
            <h1>NFC TEAMS</h1>
            {Object.entries(NFCplayoffTeams).map(([teamName, players]) => (
              <div key={teamName} style={{ borderRadius: 5, margin: '10px 5px', padding: 5 }}>
                <h3>{teamName}</h3>
                {players.map((player) => {
                  const weekValue = player[currentWeekKey] ?? 0;
                  return (
                    <div
                      key={player.playerid}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: 300,
                        marginBottom: 5,
                      }}
                    >
                      <div>{player.name}</div>
                      <input
                        type="number"
                        value={weekValue.toFixed(2)}
                        style={{ fontSize: 18, width: 80 }}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          updatePlayerInPlayoffTeams(player.playerid, currentWeekKey, e.target.value)
                        }
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
};




// import React, { useState, useEffect }from 'react';
// import { useAuth } from '../auth/AuthContext';
// import './index.css';

// type PlayerInfo = {
//   playerid: number
//   name: string;
//   position: string;
//   team: string;
//   points: number;
//   wildcard: number;
//   divisional: number;
//   championship: number;
//   superbowl: number;
// };

// const AFCteams = ['BUF', 'CIN', 'KC', 'BAL', 'HOU', 'LAC', 'PIT'];
// const NFCteams = ['DET', 'PHI', 'TB', 'LAR', 'MIN', 'WAS', 'GB'];
// type PlayoffTeams = {
//   [teamName: string]: PlayerInfo[];
// };

// const nflTeamMap = {
//     BUF: "Buffalo Bills",
//     CIN: "Cincinnati Bengals",
//     KC: "Kansas City Chiefs",
//     BAL: "Baltimore Ravens",
//     HOU: "Houston Texans",
//     LAC: "Los Angeles Chargers",
//     PIT: "Pittsburgh Steelers",
//     DET: "Detroit Lions",
//     PHI: "Philadelphia Eagles",
//     TB: "Tampa Bay Buccaneers",
//     LAR: "Los Angeles Rams",
//     MIN: "Minnesota Vikings",
//     WAS: "Washington Commanders",
//     GB: "Green Bay Packers"
// };

// const [AFCplayoffTeams, setAfcPlayoffTeams] = useState<PlayoffTeams>({
//   'Kansas City Chiefs': [],
//   'Buffalo Bills': [],
//   'Baltimore Ravens': [],
//   'Houston Texans': [],
//   'Los Angeles Chargers': [],
//   'Pittsburgh Steelers': [],
//   'Cincinnati Bengals': []
// });

// const [NFCplayoffTeams, setNfcPlayoffTeams] = useState<PlayoffTeams>({
//   'Detroit Lions': [],
//   'Philadelphia Eagles': [],
//   'Tampa Bay Buccaneers': [],
//   'Los Angeles Rams': [],
//   'Minnesota Vikings': [],
//   'Washington Commanders': [],
//   'Green Bay Packers': []
// });

// export const route = {
//     component: function updatePlayerStats() { 
//         const [players, setPlayers] = useState<PlayerInfo[]>([]);

//         useEffect(() => {
//             fetch(`http://localhost:3000/getdraftedplayers`)
//             .then((res) => {
//                 if (!res.ok) throw new Error('Failed to fetch unique players');
//                 return res.json();
//             })
//             .then((data) => {
//                 console.log(data);
//                 setPlayers(data);
                
//                 data.forEach((player: PlayerInfo) => {
//                     const fullname = nflTeamMap[player.team as keyof typeof nflTeamMap];
//                     if (AFCteams.includes(player.team)) {
//                         // Make sure fullname is a key in AFCplayoffTeams and push player
//                         if (fullname in AFCplayoffTeams) {
//                             AFCplayoffTeams[fullname].push(player);
//                         }
//                     }
//                     if (NFCteams.includes(player.team)) {
//                         // Same for NFC teams
//                         if (fullname in NFCplayoffTeams) {
//                             NFCplayoffTeams[fullname].push(player);
//                         }
//                     }
//                     const keys = ['wildcard', 'divisional', 'championship', 'superbowl'] as const;
//                     keys.forEach(key => {
//                         player[key] = player[key] ?? 0;
//                     });
//                 });

//                 console.log(AFCplayoffTeams)
//                 console.log(NFCplayoffTeams)
//             })
//             .catch((error) => {
//                 console.error('Error fetching unique players:', error);
//             });
//         }, []);

//         function testfunction() {
//             const updates = [
//                 { playerid: 50, week: 'superbowl', points: 69 },
//                 { playerid: 6, week: 'championship', points: 3 },
//                 { playerid: 58, week: 'divisional', points: 2 },
//                 { playerid: 35, week: 'superbowl', points: 20 }
//             ];

//             fetch('http://localhost:3000/updateplayerstats', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(updates)
//             })
//             .then(res => {
//                 if (!res.ok) throw new Error('Failed to update player points');
//                 return res.json();
//             })
//             .then(data => {
//                 console.log(data);
//             })
//             .catch(error => {
//                 console.error('Error updating player points:', error);
//             });
//         }

//         type WeekProp = 'wildcard' | 'divisional' | 'championship' | 'superbowl';
//         const weeks = ['Wild Card', 'Divisonal', 'Championship', 'Super Bowl'];
//         const [weekShowing, setWeekShowing] = useState('');
//         const weekKeyMap: Record<string, WeekProp> = {
//             'Wild Card': 'wildcard',
//             'Divisonal': 'divisional',
//             'Championship': 'championship',
//             'Super Bowl': 'superbowl'
//             };
//         const [currentDateTime, setCurrentDateTime] = useState(new Date());
//         // const [currentDateTime, setCurrentDateTime] = useState(new Date('2026-01-26T00:00:00'));
//         const wildCardDate = new Date('2026-01-16T00:00:00');
//         const divisonialDate = new Date('2026-01-23T00:00:00');
//         const championshipDate = new Date('2026-02-06T00:00:00');
        
//         useEffect(() => {
//             if (currentDateTime < wildCardDate) {
//                 setWeekShowing('Wild Card');
//             } else if (currentDateTime >= wildCardDate && currentDateTime < divisonialDate) {
//                 setWeekShowing('Divisonal');
//             } else if (currentDateTime >= divisonialDate && currentDateTime < championshipDate) {
//                 setWeekShowing('Championship');
//             } else {
//                 setWeekShowing('Super Bowl');
//             }
//         }, [currentDateTime]);

//         function navigateRight() {
//             const currIdx = weeks.indexOf(weekShowing);
//             if (currIdx < weeks.length - 1) {
//                 setWeekShowing(weeks[currIdx + 1]);
//             }
//         }

//         function navigateLeft() {
//             const currIdx = weeks.indexOf(weekShowing);
//             if (currIdx > 0) {
//                 setWeekShowing(weeks[currIdx - 1]);
//             }
//         }

//         function updatePlayerInPlayoffTeams(
//             playerId: number,
//             weekKey: WeekProp,
//             newValue: string
//         ) {
//             const numericValue = parseFloat(newValue);
//             if (isNaN(numericValue)) return; // ignore invalid input

//             // Update players state
//             setPlayers(prevPlayers =>
//             prevPlayers.map(player =>
//                 player.playerid === playerId ? { ...player, [weekKey]: numericValue } : player
//             )
//             );

//             // Find player's fullname to update correct playoff team array
//             const player = players.find(p => p.playerid === playerId);
//             if (!player) return;
//             const fullname = nflTeamMap[player.team as keyof typeof nflTeamMap];
//             if (!fullname) return;

//             if (AFCplayoffTeams.hasOwnProperty(fullname)) {
//             setAfcPlayoffTeams(prev => ({
//                 ...prev,
//                 [fullname]: prev[fullname].map(p =>
//                 p.playerid === playerId ? { ...p, [weekKey]: numericValue } : p
//                 ),
//             }));
//             } else if (NFCplayoffTeams.hasOwnProperty(fullname)) {
//             setNfcPlayoffTeams(prev => ({
//                 ...prev,
//                 [fullname]: prev[fullname].map(p =>
//                 p.playerid === playerId ? { ...p, [weekKey]: numericValue } : p
//                 ),
//             }));
//             }

//             console.log(`Updated player ${playerId} ${weekKey} to value:`, numericValue);
//         }


//         return (
//             <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
//                 <p style={{fontSize: '25px'}} onClick={() => testfunction()}>Update Player Stats</p>
//                 <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '300px'}}>
//                     <img src='src/assets/left-arrow.png' onClick={() => navigateLeft()} style={{width: '22px', height: '20px', marginTop: '5px', marginLeft: '40px'}}></img>
//                     <p style={{fontSize: '24px'}}>{weekShowing}</p>
//                     <img src='src/assets/right-arrow.png' onClick={() => navigateRight()} style={{width: '22px', height: '20px', marginTop: '5px'}}></img>
//                 </div>
//                 <div style={{display: 'flex', flexDirection: 'row'}}>
//                     <div>
//                         <h1 style={{fontWeight: 'bold'}}>AFC TEAMS</h1>
//                         {Object.entries(AFCplayoffTeams).map(([teamName, players]) => (
//                             <div key={teamName} style={{ borderRadius: '5px', margin: '3px 2px', padding: '3px 2px' }}>
//                                 <h3 style={{fontWeight: 'bold'}}>{teamName}</h3>
//                                 {players.map(player => {
//                                     const weekKey = weekKeyMap[weekShowing];
//                                     const weekValue = player[weekKey] ?? 0;

//                                     return (
//                                         <div key={player.playerid} style={{ borderRadius: '5px', margin: '3px 2px', padding: '3px 2px' }} >
//                                         <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '250px', marginLeft: '5px', height: '35px' }}>
//                                             <h1 style={{ fontSize: '18px' }}>{player.name}</h1>
//                                             <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '92px'}}>
//                                             <input
//                                                 key={player.playerid}
//                                                 type="number"
//                                                 value={weekValue.toFixed(2)}
//                                                 onChange={e => updatePlayerInPlayoffTeams(player.playerid, weekKey, e.target.value)}
//                                                 style={{ fontSize: '18px', width: '80px' }}
//                                             />
//                                             </div>
//                                         </div>
//                                         </div>
//                                     );
//                                 })}
//                             </div>
//                         ))}
//                     </div>
//                     <div>
//                         <h1 style={{fontWeight: 'bold'}}>NFC TEAMS</h1>
//                         {Object.entries(NFCplayoffTeams).map(([teamName, players]) => (
//                             <div key={teamName} style={{ borderRadius: '5px', margin: '3px 2px', padding: '3px 2px' }}>
//                                 <h3 style={{fontWeight: 'bold'}}>{teamName}</h3>
//                                 {players.map(player => {
//                                     const weekKey = weekKeyMap[weekShowing];
//                                     const weekValue = player[weekKey] ?? 0;

//                                     return (
//                                         <div key={player.playerid} style={{ borderRadius: '5px', margin: '3px 2px', padding: '3px 2px' }} >
//                                         <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '250px', marginLeft: '5px', height: '35px' }}>
//                                             <h1 style={{ fontSize: '18px' }}>{player.name}</h1>
//                                             <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '92px'}}>
//                                             <input
//                                                 key={player.playerid}
//                                                 type="number"
//                                                 value={weekValue.toFixed(2)}
//                                                 onChange={e => updatePlayerInPlayoffTeams(player.playerid, weekKey, e.target.value)}
//                                                 style={{ fontSize: '18px', width: '80px' }}
//                                             />
//                                             </div>
//                                         </div>
//                                         </div>
//                                     );
//                                 })}
//                             </div>
//                         ))}
//                     </div>
//                 </div>

//                 {/* {players.slice()
//                 .map(player => {
//                     return (
//                         <div key={player.playerid} style={{ borderRadius: '5px', margin: '3px 2px', padding: '3px 2px' }} >
//                         <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '250px', marginLeft: '5px', height: '35px' }}>
//                             <h1 style={{ fontSize: '18px' }}>{player.name}</h1>
//                             <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '92px'}}>
                                
//                             </div>
                            
//                         </div>
//                         </div>
//                     );
//                 })} */}
//                 {/* <h1>{weekValue.toFixed(2)}</h1>
//                                 <h1>({player.totalpoints.toFixed(2)})</h1> */}
//             </div>
//         );
//     }
// }