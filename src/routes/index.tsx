import React, { useState, useEffect } from "react";
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useAuth } from '../auth/AuthContext';
import './index.css';

type LeagueInformation = {
  leagueid: number;
  name: string;
  status: string;
};

export const route = {
  component: function Welcome() {
    const { loggedInUser } = useAuth();
    const navigate = useNavigate();

    function navigateToLeague(league: LeagueInformation) {
      console.log('leaguename', league.name);
      navigate({
        to: '/league',
        replace: true, 
        search: { name: league.name, status: league.status, id: league.leagueid }
      });
    }
    
    const [leagues, setLeagues] = useState<LeagueInformation[]>([]);
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

    const [isOpen, setIsOpen] = useState(false);
    const [leagueName, setLeagueName] = useState("");

    const createLeague = () => {
      console.log('creating league', leagueName);
      fetch(`http://localhost:3000/createleague?leaguename=${encodeURIComponent(leagueName)}`)
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        console.log(data);
        let newleagueid = data.id;

        fetch(`http://localhost:3000/leagueadduser?leagueid=${encodeURIComponent(newleagueid)}&teamname=${encodeURIComponent(loggedInUser ?? '')}`)
        .then(res => {
          if (!res.ok) throw new Error('Network response was not ok');
          return res.json();
        })
        .then(data => {
          console.log(data);
          navigate({
            to: '/league',
            replace: true, 
            search: { name: leagueName, status: 'Pre-Draft', id: newleagueid }
          });
        })
        .catch(err => console.log(err.message));
      })
      .catch(err => console.log(err.message));
    };

    return (
      <div>
        <h1>Playoff Push</h1>
        <h1>Welcome, {loggedInUser}!</h1>
        <div style={{display: 'flex', flexDirection: 'row', justifyContent: "space-between", margin: '15px 2px 0 2px'}}>
          <h1>Your Leagues</h1>
          <h1 onClick={() => setIsOpen(true)} style={{ cursor: "pointer" }}>Create League</h1>
        </div>
        
        <div className='league-list'>
          {leagues.map((league) => (
            <div className='league' onClick={() => navigateToLeague(league)}> 
              <h1>{league.name}</h1>
              <h1>{league.status}</h1>
            </div>
          ))}
        </div>

        {isOpen && (
        <>
          <div className="modal-backdrop" onClick={() => setIsOpen(false)} />
          <div className="modal">
            <h2>Create a New League</h2>
            <input type="text" value={leagueName}
              onChange={(e) => setLeagueName(e.target.value)}
              placeholder="League Name" autoFocus />
            <button onClick={() => createLeague()}>Create League</button>
          </div>
        </>
      )}
      </div>
    );
  },
};
