import { useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Player from "./components/Player";
import Options from "./components/Options";
import Hand from "./components/Hand";
import { useNavigate } from "react-router-dom";
import Card from "./components/Card";

export interface PlayerClass {
  id: number;
  name: string;
  guess: number;
  sguess: number;
  played?: string[];
  cards?: string[];
  score: number;
}

export interface GameStateClass {
  players: PlayerClass[];
  round: number;
  trump: string[];
  state: number;
  turn: number;
}

// Function to get or create a persistent client ID
function getClientId() {
  let clientId = localStorage.getItem("client_id");

  // If no client ID exists in localStorage, generate one
  if (!clientId) {
    clientId = crypto.randomUUID();
    localStorage.setItem("client_id", clientId);
  }

  return clientId;
}

function Lobby() {
  const { lobbyID } = useParams<{ lobbyID: string }>();
  const location = useLocation();
  const username = location.state?.username;
  const [leader, setLeader] = useState(false); // Use state to manage leader status
  const [players, setPlayers] = useState<PlayerClass[]>([]);
  const [gameState, setGameState] = useState<GameStateClass>();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  let clientID = getClientId();
  const navigate = useNavigate();

  useEffect(() => {
    const socket = new WebSocket(
      `ws://localhost:8000/ws/lobby/${lobbyID}?userID=${clientID}`
    );
    setSocket(socket);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data);
      if (data["status"] == 200) {
        let game_data = data["payload"];
        setPlayers(game_data["players"]);
        setGameState(game_data);
        if (game_data["players"].length === 1) {
          setLeader(true);
        }
      } else if (data["status"] == 504) {
        navigate("/");
      }
    };

    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          id: clientID,
          type: 0,
          player: { username: username, id: clientID },
        })
      );
    };
  }, []);

  return (
    <>
      <div
        className="bg-cover bg-center bg-no-repeat h-full"
        style={{ backgroundColor: "#1A2A37" }}
      >
        <div className="background-playground bg-[url('./assets/playground.png')] bg-cover bg-center relative mx-auto top-[13%] flex justify-center items-center">
          {players && players[0]?.played && (
            <Card
              key="own_card_playeddas"
              card={`${players[0].played[1]}${players[0].played[0]}`}
              xclass="handcard"
              custom_style={{
                transform: `translate(0, 3rem)`,
              }}
            />
          )}
          {(leader && gameState?.state == 0) || gameState?.state == 3 ? (
            <Options
              socket={socket}
              clientID={clientID}
              gameState={gameState}
            />
          ) : null}
          {gameState && gameState.trump ? (
            <Card
              card={`${gameState?.trump[1]}${gameState?.trump[0]}`}
              xclass="trump_card handcard"
            />
          ) : null}

          {players.slice(1).map((player, index) => {
            let distance = 360 / players.length;
            let position = 180 + ((distance * (index + 1)) % 360);
            return (
              <Player
                key={player.id}
                player={player}
                position={position}
                player_turn={gameState?.turn}
              />
            );
          })}
        </div>

        {players.length > 0 && (
          <Hand
            key={players[0].id}
            player={players[0]}
            player_turn={gameState?.turn}
            socket={socket}
            clientID={clientID}
          />
        )}
      </div>
    </>
  );
}

export default Lobby;
