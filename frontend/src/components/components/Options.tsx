import { GameStateClass } from "../Lobby";
import Player from "./Player";

function Options(props: {
  socket: WebSocket | null;
  clientID: string;
  gameState: GameStateClass;
}) {
  const { socket, clientID, gameState } = props;
  if (gameState.turn) {
    console.log(gameState);
  }
  const startGame = () => {
    if (socket) {
      socket.send(
        JSON.stringify({
          id: clientID,
          type: 1,
        })
      );
    }
  };

  const takeGuess = (index: number) => {
    console.log(clientID);
    if (socket) {
      socket.send(
        JSON.stringify({
          id: clientID,
          type: 2,
          guess: index,
        })
      );
    }
  };

  return (
    <>
      <div className="option_window">
        {gameState.state == 0 && (
          <button type="button" className="ready_button" onClick={startGame}>
            Ready
          </button>
        )}
        {gameState.state == 3 && gameState.players[0].id == gameState.turn && (
          <div>
            {Array.from({ length: gameState.round + 1 }, (_, index) => (
              <button
                key={index}
                onClick={() => takeGuess(index)}
                className="guess_button"
              >
                {index}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default Options;
