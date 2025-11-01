import React, { useState, useEffect }from 'react';
import { useAuth } from '../auth/AuthContext';

type PlayerInfo = {
  playerid: number
  name: string;
  position: string;
  team: string;
  points: number;
  wildcard: number;
  divisonal: number;
  championship: number;
  superbowl: number;
};

export const route = {
    component: function updatePlayerStats() { 
        const [players, setPlayers] = useState<PlayerInfo[]>([]);

        useEffect(() => {
            fetch(`http://localhost:3000/getdraftedplayers`)
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch unique players');
                return res.json();
            })
            .then((data) => {
                console.log(data);
                setPlayers(data);
            })
            .catch((error) => {
                console.error('Error fetching unique players:', error);
            });
        }, []);

        function testfunction() {
            const updates = [
                { playerid: 50, week: 'superbowl', points: 69 },
                { playerid: 6, week: 'championship', points: 3 },
                { playerid: 58, week: 'divisional', points: 2 },
                { playerid: 35, week: 'superbowl', points: 20 }
            ];

            fetch('http://localhost:3000/updateplayerstats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            })
            .then(res => {
                if (!res.ok) throw new Error('Failed to update player points');
                return res.json();
            })
            .then(data => {
                console.log(data);
            })
            .catch(error => {
                console.error('Error updating player points:', error);
            });
        }


        return (
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <p style={{fontSize: '25px'}} onClick={() => testfunction()}>Update Player Stats</p>
                {players.slice()
                .map(player => {
                    return (
                        <div key={player.playerid} style={{ borderRadius: '5px', margin: '3px 2px', padding: '3px 2px' }} >
                        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '250px', marginLeft: '5px', height: '35px' }}>
                            <h1 style={{ fontSize: '18px' }}>{player.name}</h1>
                            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '92px'}}>
                                {/* <h1>{weekValue.toFixed(2)}</h1>
                                <h1>({player.totalpoints.toFixed(2)})</h1> */}
                            </div>
                            
                        </div>
                        </div>
                    );
                })}
            </div>
        );
    }
}