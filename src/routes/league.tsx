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
    draftposition: string | null;
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
        const [users, setLeagues] = useState<LeagueUsers[]>([]);
        const [userTeamRows, setTeamRows] = useState<UserTeamRow[]>([]);
        const [selectedDraftOrder, setSelectedDraftOrder] = useState<boolean>(false);

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

                    if(data[0].draftposition != null) {
                        console.log('we have a draft position');
                        setSelectedDraftOrder(true);
                    }
                })
                .catch(error => {
                    console.error('Error fetching player data:', error);
                });
            }
        }, [loggedInUser]);

        useEffect(() => {
            fetch(`http://localhost:3000/getuserteam?leagueid=${encodeURIComponent(id)}`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch users team');
                return res.json();
            })
            .then((data) => {
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
            navigate({
                to: '/draft',
                replace: true, 
                search: { name: name, id: id }
            });
        }

        const [showPopup, setShowPopup] = useState(false);
        const [showDeletePopup, setDeleteShowPopup] = useState(false);
        const inviteLink = `http://localhost:5173/joinLeague?id=${id}`;

        const copyToClipboard = () => {
            navigator.clipboard.writeText(inviteLink)
            .then(() => alert('Invite link copied to clipboard!'))
            .catch(() => alert('Failed to copy invite link'));
        };
        const onBackgroundClick = () => {
            setShowPopup(false);
            setDeleteShowPopup(false);
        };
        const onPopupClick = (e: React.MouseEvent) => {
            e.stopPropagation();
        };

        function deleteLeague() {
            fetch(`http://localhost:3000/deleteleague?leagueid=${encodeURIComponent(id)}`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to delete league');
                return res.json();
            })
            .then((data) => {
                console.log('league deleted', data);
            })
            .catch(error => {
                console.error('Error Deleting League:', error);
            });
        }

        const userTeams: UserTeam[] = users.map(user => {
            const players = userTeamRows.filter(player => player.userid === user.userid);
            const totalpoints = players.reduce((sum, player) => sum + player.totalpoints, 0);
            return {
                username: user.username,
                teamname: user.teamname,
                totalpoints,
                players,
                draftposition: user.draftposition ?? null,
            };
        });

        console.log('userTeams', userTeams)
        type WeekProp = 'wildcard' | 'divisional' | 'championship' | 'superbowl';
        const weeks = ['Wild Card', 'Divisonal', 'Championship', 'Super Bowl'];
        const [weekShowing, setWeekShowing] = useState('');
        const weekKeyMap: Record<string, WeekProp> = {
            'Wild Card': 'wildcard',
            'Divisonal': 'divisional',
            'Championship': 'championship',
            'Super Bowl': 'superbowl'
            };
        const [currentDateTime, setCurrentDateTime] = useState(new Date());
        // const [currentDateTime, setCurrentDateTime] = useState(new Date('2026-01-26T00:00:00'));
        const wildCardDate = new Date('2026-01-16T00:00:00');
        const divisonialDate = new Date('2026-01-23T00:00:00');
        const championshipDate = new Date('2026-02-06T00:00:00');
        
        useEffect(() => {
            if (currentDateTime < wildCardDate) {
                setWeekShowing('Wild Card');
            } else if (currentDateTime >= wildCardDate && currentDateTime < divisonialDate) {
                setWeekShowing('Divisonal');
            } else if (currentDateTime >= divisonialDate && currentDateTime < championshipDate) {
                setWeekShowing('Championship');
            } else {
                setWeekShowing('Super Bowl');
            }
        }, [currentDateTime]);

        function navigateRight() {
            const currIdx = weeks.indexOf(weekShowing);
            if (currIdx < weeks.length - 1) {
                setWeekShowing(weeks[currIdx + 1]);
            }
        }

        function navigateLeft() {
            const currIdx = weeks.indexOf(weekShowing);
            if (currIdx > 0) {
                setWeekShowing(weeks[currIdx - 1]);
            }
        }

        function generateDraftOrder() {
            console.log('gen draft order')
        }

        return (
            <div style={{minWidth: '480px'}}>
                <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                    {status === "Post-Draft" ? (
                        <h2 style={{fontSize: '25px', marginLeft: '40px'}}>{name}</h2>
                    ) : 
                        <h2 style={{fontSize: '25px'}}>{name}</h2>
                    }
                    <div style={{display: 'flex', flexDirection: 'row'}}>
                        {status === "Post-Draft" ? (
                            <button className="buttontest" onClick={() => handleClick()} style={{marginRight: '8px'}}>Draft Results</button>
                        ) : null}
                        <img onClick={() => setDeleteShowPopup(true)} src='src/assets/trash.png' style={{width: '30px', height: '32px', marginTop: '5px'}}></img>
                    </div>
                </div>
                
                {showDeletePopup && (
                    <div onClick={onBackgroundClick} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                        backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
                        <div onClick={onPopupClick} style={{ backgroundColor: 'white', padding: '20px', 
                            borderRadius: '8px', boxShadow: '0px 0px 10px rgba(0,0,0,0.25)'}}>
                            <p style={{fontSize: '20px'}}>Delete the league: "{name}"</p>
                            <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around', marginTop: '16px'}}>
                                <button onClick={() => setDeleteShowPopup(false)} style={{ marginLeft: '8px', fontSize: '18px'}}>No</button>
                                <button onClick={() => deleteLeague()} style={{ marginRight: '8px', fontSize: '18px' }}>Yes</button>
                            </div> 
                        </div>
                    </div>
                )}

                {status === "Pre-Draft" ? (
                    userTeams.length < 4 ? (
                        <div>
                            <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                                <h1>Needs More Users</h1>
                                <button className="buttontest" onClick={() => setShowPopup(true)}>Invite Friends</button>
                            </div>
                            
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
                            <h1>Awaiting Draft</h1>
                            <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                                <button className="buttontest" onClick={() => generateDraftOrder()} style={{width: '150px'}}>Generate Draft Order</button>
                                {/* <button className="buttontest" onClick={() => console.log('user teams', userTeams)} >kys</button> */}
                                <button className="buttontest" onClick={() => handleClick()} disabled={!selectedDraftOrder}>Join Draft Room</button>
                            </div>
                            {/* <button onClick={() => handleClick()} >Join Draft Room</button> */}
                            {userTeams.slice()
                            .map((userTeam) => (
                                <div className="user"> 
                                    <h1>{userTeam.teamname}</h1>
                                </div>
                            ))}
                        </div>
                    )) : (
                    <div>
                        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                            <img src='src/assets/left-arrow.png' onClick={() => navigateLeft()} style={{width: '22px', height: '20px', marginTop: '5px', marginLeft: '40px'}}></img>
                            <p style={{fontSize: '24px'}}>{weekShowing}</p>
                            <img src='src/assets/right-arrow.png' onClick={() => navigateRight()} style={{width: '22px', height: '20px', marginTop: '5px'}}></img>
                        </div>

                        <div style={{marginTop: '10px', display: 'flex', flexDirection: 'row'}}>
                            <div style={{display: 'flex', flexDirection: 'column', marginTop: '45px'}}>
                                <span className='position-group QB'>QB</span>
                                <span className='position-group QB'>QB</span>
                                <span className='position-group RB'>RB</span>
                                <span className='position-group RB'>RB</span>
                                <span className='position-group RB'>RB</span>
                                <span className='position-group WR'>WR</span>
                                <span className='position-group WR'>WR</span>
                                <span className='position-group WR'>WR</span>
                                <span className='position-group TE'>TE</span>
                                <span className='position-group TE'>TE</span>
                            </div>

                            {userTeams.slice()
                                .sort((a, b) => b.totalpoints - a.totalpoints)
                                .map(userTeam => (
                                    <div key={userTeam.username}>
                                    <div className="user">
                                        <h1>{userTeam.teamname}</h1>
                                        <h1>{userTeam.totalpoints.toFixed(2)}</h1>
                                    </div>
                                    {userTeam.players.slice()
                                        .sort((a, b) =>
                                        positionOrder[a.position as "QB" | "RB" | "WR" | "TE"]
                                        - positionOrder[b.position as "QB" | "RB" | "WR" | "TE"]
                                        )
                                        .map(player => {
                                        const weekValue = player[weekKeyMap[weekShowing]];
                                        return (
                                            <div key={player.playerid} style={{ borderRadius: '5px', margin: '3px 2px', padding: '3px 2px' }} >
                                                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '250px', marginLeft: '5px', height: '35px' }}>
                                                    <h1 style={{ fontSize: '18px' }}>{player.name}</h1>
                                                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '92px'}}>
                                                        <h1>{weekValue.toFixed(2)}</h1>
                                                        <h1>({player.totalpoints.toFixed(2)})</h1>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                        })}
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                )}
            </div>
        );
    }
}
