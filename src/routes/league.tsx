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
        console.log('league', name, status, id);

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

        const [password, setpassword] = useState(null);
        useEffect(() => {
            fetch(`http://localhost:3000/getleaguepassword?leagueid=${encodeURIComponent(id)}`)
            .then(res => {
                console.log()
                if (!res.ok) throw new Error('Failed to fetch users team');
                return res.json();
            })
            .then((data) => {
                console.log('league password', data);
                setpassword(data[0].password)
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

        const [showPopup, setShowPopup] = useState(false);
        const inviteLink = `http://localhost:5173/joinLeague?id=${id}`;

        const copyToClipboard = () => {
            navigator.clipboard.writeText(inviteLink)
            .then(() => alert('Invite link copied to clipboard!'))
            .catch(() => alert('Failed to copy invite link'));
        };
        const onBackgroundClick = () => {
            setShowPopup(false);
        };
        const onPopupClick = (e: React.MouseEvent) => {
            e.stopPropagation();
        };

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
                        <div>
                            <h1>Needs More Users</h1>
                            <button onClick={() => setShowPopup(true)}>Invite Friends</button>

                            {showPopup && (
                                <div onClick={onBackgroundClick} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                                    backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
                                    <div onClick={onPopupClick} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px',
                                        minWidth: '300px', boxShadow: '0px 0px 10px rgba(0,0,0,0.25)'}}>
                                        <p>Send this to your friends:</p>
                                        <input type="text" value={inviteLink} readOnly style={{ width: '100%'}} />
                                        <p style={{ marginBottom: '8px' }}>Join Code: {password}</p>
                                        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around'}}>
                                            <button onClick={copyToClipboard}>Copy Link</button>
                                            <button onClick={() => setShowPopup(false)} style={{ marginLeft: '8px' }}>Close</button>
                                        </div> 
                                    </div>
                                </div>
                            )}

                            {userTeams.slice()
                            .map((userTeam) => (
                                <div className="user"> 
                                    <h1>{userTeam.teamname}</h1>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div>
                            <button onClick={() => handleClick()} >Join Draft Room</button>
                            {userTeams.slice()
                            .map((userTeam) => (
                                <div className="user"> 
                                    <h1>{userTeam.teamname}</h1>
                                </div>
                            ))}
                         </div>
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
