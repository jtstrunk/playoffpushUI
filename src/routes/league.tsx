import React, { useState, useEffect }from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate, useSearch } from '@tanstack/react-router';
import './league.css';

// type LeagueInformation = {
//   leagueid: number;
//   name: string;
//   status: string;
// };
// 
type LeagueUsers = {
    userid: number;
    username: string;
    teamname: string;
    draftposition: string;
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

const positionOrder = {
  QB: 1,
  RB: 2,
  WR: 3,
  TE: 4,
};

export const route = {
    component: function League() {
        const navigate = useNavigate();
        const { loggedInUser } = useAuth();
        const { name, status, id } = useSearch({ from: '/league' });
        console.log('league', name, status, id)

        const [users, setLeagues] = useState<LeagueUsers[]>([]);
        const [userTeamRows, setTeamRows] = useState<UserTeamRow[]>([]);
        useEffect(() => {
            if (loggedInUser) {
                fetch(`http://localhost:3000/getleaguesinformation?id=${encodeURIComponent(id)}`)
                .then(res => {
                    if (!res.ok) throw new Error('Failed to fetch users');
                    return res.json();
                })
                .then((data: LeagueUsers[]) => {
                    console.log('LeagueUsers', data);
                    setLeagues(data);
                })
                .catch(error => {
                    console.error('Error fetching player data:', error);
                });
            }
        }, [loggedInUser]);

        console.log('leagueid', id)
        useEffect(() => {
            fetch(`http://localhost:3000/getuserteam?leagueid=${encodeURIComponent(id)}`)
            .then(res => {
                console.log()
                if (!res.ok) throw new Error('Failed to fetch users team');
                return res.json();
            })
            .then((data) => {
                console.log('user teams rows', data);
                setTeamRows(data);
            })
            .catch(error => {
                console.error('Error fetching player data:', error);
            });
            
        }, []);

        function handleClick() {
            console.log('leaguename', name);
            navigate({
                to: '/draft',
                replace: true, 
                search: { name: name, id: id }
            });
        }

        const userTeams: UserTeam[] = users.map(user => {
            const players = userTeamRows.filter(player => player.userid === user.userid);
            const totalpoints = players.reduce((sum, player) => sum + player.totalpoints, 0);

            return {
                username: user.username,
                teamname: user.teamname,
                totalpoints: totalpoints,
                players: players,
            };
        });

        
        console.log('User Teams', userTeams);

        return (
            <div>
                {/* <h1>League</h1> */}
                <h2 style={{fontSize: '25px'}}>{name}</h2>
                <h3>Status: {status}</h3>
                {status === "Post-Draft" ? (
                    <h3 onClick={() => handleClick()}>View Draft Results</h3>
                ) : null}

                {status === "Pre-Draft" ? (
                    userTeams.length < 4 ? (
                        <button>Needs More Users</button>
                    ) : (
                        <button onClick={() => handleClick()} >Join Draft Room</button>
                    )) : (
                    <div className='user-list' style={{marginBottom: '40px'}}>
                        {userTeams.slice()
                        .sort((a, b) => b.totalpoints - a.totalpoints)
                        .map((userTeam) => (
                            <div key={userTeam.username}>
                            <div className="user"> 
                                <h1>{userTeam.teamname}</h1>
                                <h1>{userTeam.totalpoints.toFixed(2)}</h1>
                            </div>
                            {userTeam.players.slice()
                                .sort((a, b) => 
                                positionOrder[a.position as "QB" | "RB" | "WR" | "TE"] - 
                                positionOrder[b.position as "QB" | "RB" | "WR" | "TE"]
                                )
                                .map((player) => (
                                    <div key={player.playerid} style={{borderRadius: '5px', margin: '3px 2px', 
                                        padding: '3px 2px', backgroundColor: 'lightGrey'}} >
                                        <div style={{ display: 'flex', flexDirection: 'row',
                                            justifyContent: 'space-between', width: '240px', marginLeft: '5px'}}>
                                            <h1>{player.position}</h1>
                                            <h1>{player.name}</h1>
                                            <h1>{player.totalpoints.toFixed(2)}</h1>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'row',
                                            justifyContent: 'space-between', width: '240px', marginLeft: '5px'}}>
                                            <div>
                                                <h1>{player.wildcard.toFixed(2)}</h1>
                                                <h1 style={{fontSize: 'smaller'}}>WC</h1>
                                            </div>
                                            <div>
                                                <h1>{player.divisional.toFixed(2)}</h1>
                                                <h1 style={{fontSize: 'smaller'}}>DIV</h1>
                                            </div>
                                            <div>
                                                <h1>{player.championship.toFixed(2)}</h1>
                                                <h1 style={{fontSize: 'smaller'}}>CHA</h1>
                                            </div>
                                            <div>
                                                <h1>{player.superbowl.toFixed(2)}</h1>
                                                <h1 style={{fontSize: 'smaller'}}>SB</h1>
                                            </div>
                                        </div>  
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }
}
