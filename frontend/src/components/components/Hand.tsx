import Card from "./Card";
import { GameStateClass, PlayerClass } from "../Lobby";

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
  const isPlayableEmpty = player.playable.length === 0;
  return (
    <>
      <div className="own_hand ">
        <div className="relative w-[40rem] mx-auto mt-[110px] flex justify-center hand">
          {player.cards?.map((card, index) => {
            // Determine if the button should be enabled or disabled
            const isDisabled =
              (!isPlayableEmpty && !player.playable[index]) || player.played;

            // Add 'disabled' class if not playable or 'enabled' if playable
            const isEnabled_class = `handcard handcard1 ${
              isDisabled
                ? "filter brightness-50 z-10"
                : "transition-transform duration-300 hover:translate-y-[-10px] cursor-pointer z-10"
            }`;

            return (
              <Card
                key={`own_${card[0]}_${index}`}
                card={`${card[1]}${card[0]}`}
                xclass={isEnabled_class}
                onClick={playCard}
              />
            );
          })}
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
