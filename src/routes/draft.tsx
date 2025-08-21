import React, { useState, useEffect } from "react";
import { useAuth } from '../auth/AuthContext';
import './draft.css';

type PlayerInfo = {
  name: string;
  position: string;
  team: string;
  points: number;
};

const users: string[] = ["Josh", "Nate", "Sam", "Ethan"]

type Team = {
  userName: string;
  players: PlayerInfo[];
};

const initialUserTeams: Team[] = [
  {userName: users[0], players: []},
  {userName: users[1], players: []},
  {userName: users[2], players: []},
  {userName: users[3], players: []}
]

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
    const { loggedInUser } = useAuth();
    const [showingList, setShowingList] = useState('ALL');
    const [selectedUser, setSelectedUser] = useState('current');
    // const [players, setPlayers] = React.useState(initialPlayers);
    const [userTeams, setUserTeams] = useState<Team[]>(initialUserTeams);
    const { turnIndex, nextTurn } = useSnakeDraftTurns(users.length);

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

    function draftPlayer(draftedPlayer: PlayerInfo) {
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
      
      nextTurn();
    }


    return (
      <main className="flex items-center justify-center pt-16 pb-4">
        <div className="flex-1 flex flex-col items-center gap-6 min-h-0">
          <header className="flex flex-col items-center gap-9">
            <h1>Draft Page</h1>
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
              <div key={userTeams[turnIndex].userName}>
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
        {playerTeam.players.filter(player => player.position === "QB").map((player) => (
          <DraftedPlayer playerInformation={player} key={player.name} />
        ))}
      </div>
      <div className='test' style={{height: '64px', display: 'flex', alignItems: 'center'}}>
        <p style={{width: '26px', marginRight: '6px'}}>WR</p>
        {playerTeam.players.filter(player => player.position === "WR").map((player) => (
          <DraftedPlayer playerInformation={player} key={player.name} />
        ))}
      </div>
      <div className='test' style={{height: '64px', display: 'flex', alignItems: 'center'}}>
        <p style={{width: '26px', marginRight: '6px'}}>RB</p>
        {playerTeam.players.filter(player => player.position === "RB").map((player) => (
          <DraftedPlayer playerInformation={player} key={player.name} />
        ))}
      </div>
      <div className='test' style={{height: '64px', display: 'flex', alignItems: 'center'}}>
        <p style={{width: '26px', marginRight: '6px'}}>TE</p>
        {playerTeam.players.filter(player => player.position === "TE").map((player) => (
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

  return { turnIndex, nextTurn };
}