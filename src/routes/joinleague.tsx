import React, { useState, useEffect }from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate, useSearch } from '@tanstack/react-router';
import './league.css';

export const route = {
    component: function joinleague() {
        const navigate = useNavigate();
        const { loggedInUser } = useAuth();
        const [leagueName, setLeagueName] = useState(null);
        const [password, setPassword] = useState('');
        const { id } = useSearch({ from: '/joinleague' });
        console.log('league', id);

        useEffect(() => {
            fetch(`http://localhost:3000/getspecificleagueinformation?leagueid=${encodeURIComponent(id)}`)
                .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch league information');
                return res.json();
                })
                .then((data) => {
                    console.log(data)
                    setLeagueName(data[0].name);
                })
                .catch((error) => {
                    console.error('Error fetching league information:', error);
                });
            }, [id]);

        function joinLeague() {
            console.log(`joining league ${leagueName}(${id}) with password ${password}`);

            fetch(`http://localhost:3000/checkleaguepassword?id=${encodeURIComponent(id)}&inputpassword=${encodeURIComponent(password)}`)
            .then(res => {
                console.log()
                if (!res.ok) throw new Error('Failed to fetch users team');
                return res.json();
            })
            .then((data) => {
                console.log('passwordcheck', data);
                if(data.success == true) {
                    console.log("JOINED LEAGUE")
                    fetch(`http://localhost:3000/leagueadduser?leagueid=${encodeURIComponent(id)}&teamname=${encodeURIComponent(loggedInUser ?? '')}`)
                    .then(res => {
                        if (!res.ok) throw new Error('Network response was not ok');
                        return res.json();
                    })
                    .then(data => {
                        console.log(data);
                    navigate({
                        to: '/league',
                        replace: true, 
                        search: { name: leagueName, status: 'Pre-Draft', id: id }
                    });
                    })
                    .catch(err => console.log(err.message));
                }
            })
            .catch(error => {
                console.error('Error fetching player data:', error);
            });
        }

        return (
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <p style={{fontSize: '25px'}}>{loggedInUser}, you're invited to join the league</p>
                <p style={{fontSize: '30px'}}>{leagueName}</p>

                <label htmlFor="password">Password</label>
                <input className='textinput' id="password"
                    placeholder="Password" type="text" value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button style={{border: '1px solid black', padding: '2px 5px'}} onClick={() => joinLeague()}>Join League</button>
            </div>
        );
    }
}
