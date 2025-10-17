import React, { useState, useEffect }from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate, useSearch } from '@tanstack/react-router';
import './league.css';

type LeagueInformation = {
  leagueid: number;
  name: string;
  status: string;
};

export const route = {
    component: function League() {
        const navigate = useNavigate();
        const { loggedInUser } = useAuth();
        const [userEmail, setUserEmail] = useState<string>('');
        const [leagues, setLeagues] = useState<LeagueInformation[]>([]);
        const [showPopup, setShowPopup] = useState(false);
        const [passwordChanged, setPasswordChanged] = useState(false);
        const [incorrectPassword, setIncorrectPassword] = useState(false);
        const [currentPassword, setCurrentPassword] = useState<string>('');
        const [newPassword, setNewPassword] = useState<string>('');

        useEffect(() => {
            if (loggedInUser) {
                fetch(`http://localhost:3000/getuserinformation?username=${encodeURIComponent(loggedInUser)}`)
                .then(res => {
                    if (!res.ok) throw new Error('Failed to fetch users');
                    return res.json();
                })
                .then((data) => {
                    console.log(data);
                    setUserEmail(data[0].emailaddress)
                })
                .catch(error => {
                    console.error('Error fetching player data:', error);
                });
            }
        }, [loggedInUser]);

        useEffect(() => {
            if (loggedInUser) {
            fetch(`http://localhost:3000/getuserleagues?username=${encodeURIComponent(loggedInUser)}`)
                .then(res => {
                if (!res.ok) throw new Error('Failed to fetch players');
                return res.json();
                })
                .then((data: LeagueInformation[]) => {
                console.log('LeagueInformation', data);
                setLeagues(data);
                })
                .catch(error => {
                console.error('Error fetching player data:', error);
                });
            }
        }, [loggedInUser]);

        function navigateToLeague(league: LeagueInformation) {
            console.log('leaguename', league.name);
            navigate({
                to: '/league',
                replace: true, 
                search: { name: league.name, status: league.status, id: league.leagueid }
            });
        }

        function updatePassword() {
            if (loggedInUser) {
                fetch(`http://localhost:3000/changepassword?username=${encodeURIComponent(loggedInUser)}&currentPassword=${encodeURIComponent(currentPassword)}&newPassword=${encodeURIComponent(newPassword)}`)
                .then(async (response) => {
                    if (!response.ok) {
                    const errorData = await response.json();
                    setIncorrectPassword(true);
                    throw new Error(errorData.error || 'Failed to update password');
                    }
                    return response.json();
                })
                .then((data) => {
                    setShowPopup(false);
                    setPasswordChanged(true);
                    setIncorrectPassword(false);
                })
                .catch((error) => {
                    console.error('Error Updating Password:', error);
                });
            }
        }


        function closePopup(){
            setIncorrectPassword(false);
            setShowPopup(false);
            setPasswordChanged(false);
        }

        const onBackgroundClick = () => {
            setIncorrectPassword(false);
            setShowPopup(false);
            setPasswordChanged(false);
        };

        const onPopupClick = (e: React.MouseEvent) => {
            e.stopPropagation();
        };

        return (
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <div>
                    <div style={{display: 'flex', flexDirection: 'row'}}>
                        <img style={{width: '105px', height: '105px', borderRadius: '50%'}} src='src/assets/profile.jpg'></img>
                        <div>
                            <p style={{fontSize: '20px', marginLeft: '15px', marginTop: '2px'}}>{ loggedInUser }</p>
                            <p style={{fontSize: '16px', marginLeft: '15px'}}>{ userEmail }</p>
                            <button style={{ marginLeft: '14px', width: '140px'}} className="buttontest" onClick={() => setShowPopup(true)}>Change Password</button>
                        </div>
                    </div>
                    <div className='league-list' style={{ marginTop: '16px'}}>
                        {leagues.map((league) => (
                            <div className='league' onClick={() => navigateToLeague(league)} style={{ width: '350px'}}>
                            <h1>{league.name}</h1>
                            <h1>{league.status}</h1>
                            </div>
                        ))}
                    </div>
                </div>

                {showPopup && (
                    <div onClick={onBackgroundClick} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                        backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
                        <div onClick={onPopupClick} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px',
                            width: '300px', boxShadow: '0px 0px 10px rgba(0,0,0,0.25)'}}>
                            <p style={{ textAlign: 'center', fontSize: '20px'}}>Change Your Password</p>
                            {incorrectPassword == true ? (
                                <p style={{textAlign: 'center', fontSize: '21px', color: 'red'}}>Incorrect Current Password</p>
                            ) : null }
                            <label>Current Password</label>
                            <input type="password" onChange={(e) => setCurrentPassword(e.target.value)}
                                style={{ width: '100%', border: '1px solid grey', borderRadius: '7px' }} />
                            <label>New Password</label>
                            <input type="password" onChange={(e) => setNewPassword(e.target.value)}
                                style={{ width: '100%', border: '1px solid grey', borderRadius: '7px' }} />

                            <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around', marginTop: '6px'}}>
                                <button onClick={() => closePopup()} style={{ marginLeft: '8px' }}>Close</button>
                                <button onClick={() => updatePassword()} style={{ marginLeft: '8px' }}>Update Password</button>
                            </div> 
                        </div>
                    </div>
                )}

                {passwordChanged && (
                    <div onClick={onBackgroundClick} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                        backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
                        <div onClick={onPopupClick} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px',
                            width: '300px',  height: '120px', boxShadow: '0px 0px 10px rgba(0,0,0,0.25)'}}>
                            <p style={{ textAlign: 'center', fontSize: '20px'}}>Password Succesfully Updated</p>
                            
                            <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around', marginTop: '20px'}}>
                                <button onClick={() => closePopup()} style={{ marginLeft: '8px' }}>Close</button>

                            </div> 
                        </div>
                    </div>
                )}
            </div>
        );
    }
}
