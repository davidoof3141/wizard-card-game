import Card from "./Card";
import { PlayerClass } from "../Lobby";

function Hand(props: {
  player: PlayerClass;
  player_turn?: number;
  socket: WebSocket | null;
  clientID: string;
}) {
  const { player, player_turn, socket, clientID } = props;
  let isYourTurn = player_turn === player.id;

  const playCard = (card: string) => {
    if (socket) {
      socket.send(
        JSON.stringify({
          id: clientID,
          type: 3,
          played: card,
        })
      );
    }
  };

  return (
    <>
      <div className="own_hand ">
        <div className="relative w-[40rem] mx-auto mt-[110px] flex justify-center hand">
          {player.cards?.map((card, index) => (
            <Card
              key={card[0]}
              card={`${card[1]}${card[0]}`}
              xclass="handcard handcard1 transition-transform duration-300 hover:translate-y-[-10px] cursor-pointer"
              onClick={playCard}
            />
          ))}
        </div>
        <div
          className={`bg-[rgb(180,147,103)] rounded-[4%] mx-auto mt-2.5 ${
            isYourTurn ? "highlight_name" : ""
          }`}
          style={{ width: "100px" }}
        >
          {player.name}{" "}
          {player.guess != -1 && `${player.sguess}/${player.guess} `}
          {player.score}
        </div>
      </div>
    </>
  );
}

export default Hand;
