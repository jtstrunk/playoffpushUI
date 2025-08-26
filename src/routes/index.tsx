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

    function handleClick(league: LeagueInformation) {
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


    return (
      <div>
        <h1>Playoff Push</h1>
        <h1>Welcome, {loggedInUser}!</h1>
        
        <h1 style={{marginTop: '15px'}}>Your Leagues</h1>
        <div className='league-list'>
          {leagues.map((league) => (
            <div className='league' onClick={() => handleClick(league)}> 
              <h1>{league.name}</h1>
              <h1>{league.status}</h1>
            </div>
          ))}
        </div>
      </div>
    );
  },
};
