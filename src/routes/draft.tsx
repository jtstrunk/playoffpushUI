import React, { useState, useEffect } from "react";
import { useAuth } from '../auth/AuthContext';
import { useSearch } from '@tanstack/react-router';
import io from 'socket.io-client';
import './draft.css';

const socket = io('http://localhost:3000');

type User = {
  userid: number;
  teamname: string;
}

type PlayerInfo = {
  playerid: number
  name: string;
  position: string;
  team: string;
  points: number;
};

type PlayerDraftedInfo = PlayerInfo & {
  draftPickNumber: number;
  userName: string;
  leaguename: string;
  id: string | number;
};


type Team = {
  userName: string;
  players: PlayerInfo[];
};

interface UserTeamRow {
  leagueid: number;
  userid: number;
  playerid: number;
  username: string;
  teamname: string;
  name: string;
  position: string;
  wildcard: number;
  divisional: number;
  championship: number;
  superbowl: number;
  totalpoints: number;
}

type UserTeam = {
  username: string;
  teamname: string;
  totalpoints: number;
  players: UserTeamRow[];
}

export function UserTeam(draftedTeam: Team){
  return(
    <div>
      <h1>{draftedTeam.userName}</h1>
      <div className='draft-board'>
        {draftedTeam.players.map((player) => (
          <div className='draftable-player-div'> 
            <h1>{player.name}</h1>
            <span>{player.position}</span><span> - </span><span>{player.team}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// export function DraftedPlayer({playerInformation, onRemove}: { playerInformation: PlayerInfo; onRemove: (name: string) => void; }) {
export function DraftedPlayer({playerInformation}: { playerInformation: PlayerInfo }) {
  function handleClick() {
    console.log('drafted', playerInformation.name)
    // onRemove(playerInformation.name);
  }

  return(
    <div className={`draftable-player-div ${playerInformation.position.toLowerCase()}`} onClick={handleClick}> 
      <h1 style={{fontSize: playerInformation.name.length > 15 ? "smaller" : "medium"}}>{playerInformation.name}</h1>
      <span>{playerInformation.position}</span><span> - </span><span>{playerInformation.team}</span>
    </div>
  )
}

export const route = {
  component: function Welcome() {
    const { loggedInUser} = useAuth();
    const [showingList, setShowingList] = useState('ALL');
    const [selectedUser, setSelectedUser] = useState('current');
    const [users, setUsers] = useState<string[]>([]);
    const [userTeams, setUserTeams] = useState<Team[]>([]);
    const [fullUsers, setFullUsers] = useState<User[]>([]);
    const { turnIndex, nextTurn, setTurnTo } = useSnakeDraftTurns(users.length);
    const [draftPickNumber, setDraftPickNumber] = useState(1);
    const [leagueStatus, setLeagueStatus] = useState(null);
    const {name, id} = useSearch({ from: '/draft' });

    useEffect(() => {
      fetch(`http://localhost:3000/getleagueusers?leagueid=${encodeURIComponent(id)}`)
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch league users");
          return res.json();
        })
        .then((data: User[]) => {
          setFullUsers(data);
          const fetchedUsers = data.map(u => u.teamname);
          setUsers(fetchedUsers);

          const initialTeams: Team[] = fetchedUsers.map(userName => ({
            userName,
            players: [],
          }));
          setUserTeams(initialTeams);
        })

        .catch(error => {
          console.error("Error fetching league users:", error);
        });
    }, [id]);

    useEffect(() => {
      fetch(`http://localhost:3000/getspecificleagueinformation?leagueid=${encodeURIComponent(id)}`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch league information');
          return res.json();
        })
        .then((data) => {
          console.log(data)
          setLeagueStatus(data[0].status);
        })
        .catch((error) => {
          console.error('Error fetching league information:', error);
        });
    }, [id]); // Run on id or on mount

    useEffect(() => {
      if (leagueStatus === 'Post-Draft') {
        fetch(`http://localhost:3000/getuserteam?leagueid=${encodeURIComponent(id)}`)
          .then(res => {
            if (!res.ok) throw new Error('Failed to fetch user team');
            return res.json();
          })
          .then((data) => {
            console.log('user teams rows', data);
            
            const user1teams: PlayerInfo[] = data
              .filter((player: UserTeamRow) => player.userid === 1)
              .map((row: UserTeamRow): PlayerInfo => ({ playerid: row.playerid,
                name: row.name, position: row.position,
                team: row.teamname, points: row.totalpoints,
              }));
            const user2teams: PlayerInfo[] = data
              .filter((player: UserTeamRow) => player.userid === 2)
              .map((row: UserTeamRow): PlayerInfo => ({ playerid: row.playerid,
                name: row.name, position: row.position,
                team: row.teamname, points: row.totalpoints,
              }));
            const user3teams: PlayerInfo[] = data
              .filter((player: UserTeamRow) => player.userid === 3)
              .map((row: UserTeamRow): PlayerInfo => ({ playerid: row.playerid,
                name: row.name, position: row.position,
                team: row.teamname, points: row.totalpoints,
              }));
            const user4teams: PlayerInfo[] = data
              .filter((player: UserTeamRow) => player.userid === 4)
              .map((row: UserTeamRow): PlayerInfo => ({ playerid: row.playerid,
                name: row.name, position: row.position,
                team: row.teamname, points: row.totalpoints,
              }));

            setUserTeams(prevUserTeams => {
              const newUserTeams = [...prevUserTeams];

              newUserTeams[0] = { ...newUserTeams[0], players: user1teams };
              newUserTeams[1] = { ...newUserTeams[1], players: user2teams };
              newUserTeams[2] = { ...newUserTeams[2], players: user3teams };
              newUserTeams[3] = { ...newUserTeams[3], players: user4teams };

              return newUserTeams;
            });


          })
          .catch(error => {
            console.error('Error fetching user team:', error);
          });
      }
    }, [leagueStatus, id]);


    const [players, setPlayers] = useState<PlayerInfo[]>([]);
    useEffect(() => {
      fetch('http://localhost:3000/getplayers')
        .then((res) => {
          if (!res.ok) {
            throw new Error('Failed to fetch players');
          }
          return res.json();
        })
        .then((data: PlayerInfo[]) => {
          console.log('DraftablePlayers', data)
          setPlayers(data);
        })
        .catch((error) => {
          console.error('Error fetching player data:', error);
        });
    }, []);

    useEffect(() => {
      const urlParams = new URLSearchParams(window.location.search);
      const name = urlParams.get('name');
      const id = urlParams.get('id');

      if (name && id) {
        // Tell server which room to join
        socket.emit('joinRoom', { name, id });
      }

      socket.on('playerDrafted', (data: PlayerDraftedInfo) => {
        console.log('Player drafted event in room:', data);
        // data is draftPickNumber, id, name (leaguename), playerName, playerid, Username
        setPlayers(prevPlayers => {
          return prevPlayers.filter(player => player.name !== data.name);
        });

        var testobj = {
          0: [1, 8, 9, 16, 17, 24, 25, 32, 33, 40],
          1: [2, 7, 10, 15, 18, 23, 26, 31, 34, 39],
          2: [3, 6, 11, 14, 19, 22, 27, 30, 35, 38],
          3: [4, 5, 12, 13, 20, 21, 28, 29, 36, 37]
        }

        function findKeyByValue(obj: { [key: string]: number[] }, number: number): number | null {
          for (const key in obj) {
            if (obj[key].includes(number)) {
              return Number(key);
            }
          }
          return null;
        }
        
        var nextDraftPick = findKeyByValue(testobj, data.draftPickNumber + 1)
        setTurnTo(nextDraftPick ?? 0);
        setDraftPickNumber(data.draftPickNumber + 1)
        setUserTeams(prevUserTeams => {
          // Find the index of the current team using the userName from your users array and turnIndex
          const teamIndex = prevUserTeams.findIndex(team => team.userName === data.userName);
          console.log('index', teamIndex)
          if (teamIndex === -1) return prevUserTeams; // team not found, return current state

          // Create a new updated team by adding the drafted player data to the players list
          const updatedTeam = {
            ...prevUserTeams[teamIndex],
            players: [...prevUserTeams[teamIndex].players, data],
          };

          // Copy the previous teams array, replace the updated team at teamIndex
          const newUserTeams = [...prevUserTeams];
          newUserTeams[teamIndex] = updatedTeam;

          // Return the new modified teams array to update state
          return newUserTeams;
        });
      });

      // Cleanup to avoid multiple handlers
      return () => {
        socket.off('playerDrafted');
      };
    }, []);

    function draftPlayer(draftedPlayer: PlayerInfo) {
      console.log('draft index', turnIndex)
      console.log('Draft Pick Number: ', draftPickNumber)
      console.log(users[turnIndex], 'drafted', draftedPlayer.name);
      let positionCheck = 0;
      userTeams[turnIndex].players.forEach(element => {
        if(element.position == draftedPlayer.position) {
          positionCheck++;
        }
      });

      if(draftedPlayer.position == 'QB' && positionCheck >= 2) {
        return;
      } else if(draftedPlayer.position == 'WR' && positionCheck >= 3) {
        return;
      } else if(draftedPlayer.position == 'RB' && positionCheck >= 3) {
        return;
      } else if(draftedPlayer.position == 'TE' && positionCheck >= 2) {
        return;
      }

      setPlayers(players.filter(player => player.name !== draftedPlayer.name));
      console.log(draftedPlayer)

      setUserTeams(prevUserTeams => {
        // Find index of the current team
        const teamIndex = prevUserTeams.findIndex(team => team.userName === users[turnIndex]);
        if (teamIndex === -1) return prevUserTeams; // team not found

        // Copy the team and add drafted player
        const updatedTeam = {
          ...prevUserTeams[teamIndex],
          players: [...prevUserTeams[teamIndex].players, draftedPlayer],
        };

        // Copy the entire userTeams array replacing the updated team
        const newUserTeams = [...prevUserTeams];
        newUserTeams[teamIndex] = updatedTeam;

        return newUserTeams;
      })

      let user = fullUsers.find(user => user.teamname == users[turnIndex])
      if (!user) {
        console.error('no user')
        return;
      }

      fetch(`http://localhost:3000/draftplayer?leagueid=${encodeURIComponent(id)}&userid=${encodeURIComponent(user?.userid)}
        &playerid=${encodeURIComponent(draftedPlayer.playerid)}&draftpick=${encodeURIComponent(draftPickNumber)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to record draft');
        return res.json();
      })
      .then((data) => {
        console.log('Draft player response', data);
        setDraftPickNumber(prev => prev + 1);
      })
      .catch((error) => {
        console.error('Error drafting player:', error);
      });

      socket.emit('draftPlayer', {
        playerid: draftedPlayer.playerid,
        position: draftedPlayer.position,
        team: draftedPlayer.team,
        draftPickNumber,
        userName: users[turnIndex],
        name: draftedPlayer.name,
        leaguename: name,
        id
      });
      console.log('current draft index', turnIndex)

      nextTurn();
      if(draftPickNumber == 40) {
        fetch(`http://localhost:3000/setstatus?leagueid=${encodeURIComponent(id)}&status=${encodeURIComponent('Post-Draft')}`)
          .then((res) => {
            if (!res.ok) throw new Error('Failed to record draft');
            return res.json();
          })
          .then((data) => {
            console.log('Draft player response', data);
          })
          .catch((error) => {
            console.error('Error drafting player:', error);
        });
      }
    }

    return (
      <main className="flex items-center justify-center pt-16 pb-4">
        <div className="flex-1 flex flex-col items-center gap-6 min-h-0">
          <header className="flex flex-col items-center gap-9">
            <h1>Draft Page - {name} - {leagueStatus}</h1>
            <h1>Welcome, {loggedInUser}!</h1>
          </header>
          <div>
            <div className="test">
              <p style={{width: '86px'}}></p>
              <p style={{width: '154px', textAlign: 'center'}}>Round One</p>
              <p style={{width: '154px', textAlign: 'center'}}>Round Two</p>
              <p style={{width: '154px', textAlign: 'center'}}>Round Three</p>
              <p style={{width: '154px', textAlign: 'center'}}>Round Four</p>
              <p style={{width: '154px', textAlign: 'center'}}>Round Five</p>
              <p style={{width: '154px', textAlign: 'center'}}>Round Six</p>
              <p style={{width: '154px', textAlign: 'center'}}>Round Seven</p>
              <p style={{width: '154px', textAlign: 'center'}}>Round Eight</p>
              <p style={{width: '154px', textAlign: 'center'}}>Round Nine</p>
              <p style={{width: '154px', textAlign: 'center'}}>Round Ten</p>
            </div>
            {userTeams.map((team) => (
              <div key={team.userName} className='drafted-row'>
                <p style={{width: '80px', marginRight: '6px'}}>{team.userName}</p>
                <ul className='test'>
                  {team.players.map((player) => (
                    <DraftedPlayer playerInformation={player} key={player.name} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className='bottom-feed'>
            <div className='draftable-players'>
              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <p onClick={() => setShowingList('ALL')} style={{cursor: 'pointer', padding: '0 8px',
                  border: showingList === 'ALL' ? '1px solid black' : 'none', marginLeft: '25px'}}>ALL</p> 
                <p onClick={() => setShowingList('QB')} style={{cursor: 'pointer', padding: '0 8px',
                  border: showingList === 'QB' ? '1px solid black' : 'none'}}>QB</p>
                <p onClick={() => setShowingList('WR')} style={{cursor: 'pointer', padding: '0 8px',
                  border: showingList === 'WR' ? '1px solid black' : 'none'}}>WR</p>
                <p onClick={() => setShowingList('RB')} style={{cursor: 'pointer', padding: '0 8px',
                  border: showingList === 'RB' ? '1px solid black' : 'none'}}>RB</p>
                <p onClick={() => setShowingList('TE')} style={{cursor: 'pointer', padding: '0 8px',
                  border: showingList === 'TE' ? '1px solid black' : 'none', marginRight: '25px'}} >TE</p>
              </div>
              <ul className="custom-list">
                {(showingList === 'ALL' ? players : players.filter(player => player.position === showingList))
                  .sort((a, b) => b.points - a.points)
                  .map(player => (
                    <li key={player.name} onClick={() => draftPlayer(player)}>
                      {player.name} - {player.position} ({player.team}) - {player.points}
                    </li>
                  ))
                }
              </ul>
            </div>
            <div className='drafted-players'>
              <div key={userTeams[turnIndex]?.userName}>
                <div style={{ display: 'flex', flexDirection: 'row', width: '430px', justifyContent: 'space-between' }}>
                  <p onClick={() => setSelectedUser('current')} style={{ cursor: 'pointer', padding: '0 8px',
                    border: selectedUser === 'current' ? '1px solid black' : 'none'}}>Current</p>
                  <p onClick={() => setSelectedUser('playerone')}style={{ cursor: 'pointer', padding: '0 8px',
                    border: selectedUser === 'playerone' ? '1px solid black' : 'none'}}>{users[0]}</p>
                  <p onClick={() => setSelectedUser('playertwo')}style={{ cursor: 'pointer', padding: '0 8px',
                    border: selectedUser === 'playertwo' ? '1px solid black' : 'none'}}>{users[1]}</p>
                  <p onClick={() => setSelectedUser('playerthree')}style={{ cursor: 'pointer', padding: '0 8px',
                    border: selectedUser === 'playerthree' ? '1px solid black' : 'none'}}>{users[2]}</p>
                  <p onClick={() => setSelectedUser('playerfour')}style={{ cursor: 'pointer', padding: '0 8px',
                    border: selectedUser === 'playerfour' ? '1px solid black' : 'none'}}>{users[3]}</p>
                </div>
                {(() => {
                  if (selectedUser == 'current') {
                    return (
                      <div>
                        <DraftedTeam playerTeam={userTeams[turnIndex]} />
                      </div>
                    )
                  } else if (selectedUser == 'playerone') {
                    return (
                    <div><DraftedTeam playerTeam={userTeams[0]} /></div>
                  )
                  }else if (selectedUser == 'playertwo') {
                    return (
                      <div><DraftedTeam playerTeam={userTeams[1]} /></div>
                    )
                  } else if (selectedUser == 'playerthree') {
                    return (
                      <div><DraftedTeam playerTeam={userTeams[2]} /></div>
                    )
                  } else if (selectedUser == 'playerfour') {
                    return (
                      <div><DraftedTeam playerTeam={userTeams[3]} /></div>
                    )
                  } else {
                    return (
                      <div><DraftedTeam playerTeam={userTeams[turnIndex]} /></div>
                    )
                  }
                })()}
              </div>
            </div>
          </div>
          
        </div>
      </main>
    );
  }
}
export function DraftedTeam({ playerTeam }: { playerTeam: Team }) {
  return (
    <div>
      <div className='test' style={{height: '64px', display: 'flex', alignItems: 'center'}}>
        <p style={{width: '26px', marginRight: '6px'}}>QB</p>
        {playerTeam?.players.filter(player => player.position === "QB").map((player) => (
          <DraftedPlayer playerInformation={player} key={player.name} />
        ))}
      </div>
      <div className='test' style={{height: '64px', display: 'flex', alignItems: 'center'}}>
        <p style={{width: '26px', marginRight: '6px'}}>WR</p>
        {playerTeam?.players.filter(player => player.position === "WR").map((player) => (
          <DraftedPlayer playerInformation={player} key={player.name} />
        ))}
      </div>
      <div className='test' style={{height: '64px', display: 'flex', alignItems: 'center'}}>
        <p style={{width: '26px', marginRight: '6px'}}>RB</p>
        {playerTeam?.players.filter(player => player.position === "RB").map((player) => (
          <DraftedPlayer playerInformation={player} key={player.name} />
        ))}
      </div>
      <div className='test' style={{height: '64px', display: 'flex', alignItems: 'center'}}>
        <p style={{width: '26px', marginRight: '6px'}}>TE</p>
        {playerTeam?.players.filter(player => player.position === "TE").map((player) => (
          <DraftedPlayer playerInformation={player} key={player.name} />
        ))}
      </div>
    </div>
  )
}


// Helpers 
function useSnakeDraftTurns(usersCount: number) {
  const [turnIndex, setTurnIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [repeatCount, setRepeatCount] = useState(0);

  function nextTurn() {
    setTurnIndex(prevIndex => {
      let nextIndex = prevIndex + direction;
      let nextRepeat = repeatCount;

      // Handle bounds and snake behavior
      if (nextIndex >= usersCount) {
        // At the end: stay two times then reverse
        if (repeatCount < 1) {
          nextRepeat++;
          setRepeatCount(nextRepeat);
          nextIndex = prevIndex; // stay on last user
        } else {
          // After repeating twice, reverse direction
          setDirection(-1);
          setRepeatCount(0);
          nextIndex = prevIndex - 1; // start going backward
        }
      } else if (nextIndex < 0) {
        // At the start: stay two times then reverse
        if (repeatCount < 1) {
          nextRepeat++;
          setRepeatCount(nextRepeat);
          nextIndex = prevIndex; // stay on first user
        } else {
          setDirection(1);
          setRepeatCount(0);
          nextIndex = prevIndex + 1; // start going forward
        }
      } else {
        // Normal advance, reset repeat count
        setRepeatCount(0);
      }

      return nextIndex;
    });
  }

  function setTurnTo(index: number) {
    setTurnIndex(index);
  }

  return { turnIndex, nextTurn, setTurnTo  };
}