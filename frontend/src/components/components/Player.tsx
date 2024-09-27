import { PlayerClass } from "../Lobby";
import Card from "./Card";

function Player(props: {
  player: PlayerClass;
  position: number;
  player_turn?: number;
}) {
  const { player, position, player_turn } = props;
  return (
    <>
      <div
        className="absolute w-36 h-28 flex justify-center items-center flex-col"
        style={{ transform: `rotate(${position}deg) translate(0, -20rem)` }}
      >
        {player?.played && (
          <Card
            key={`${Math.random()}`}
            card={`${player.played[1]}${player.played[0]}`}
            xclass="handcard absolute"
            custom_style={{
              transform: `translate(0, 17rem)`,
            }}
          />
        )}
        <div
          className={`w-1/2 bg-[rgb(180,147,103)] rounded-[10%] ${
            player_turn === player.id ? "highlight_name" : ""
          }`}
        >
          {player.name}{" "}
          {player.guess != -1 && `${player.sguess}/${player.guess} `}
          {player.score}
        </div>
        <div className="flex justify-center w-[7rem] h-[5.5rem] relative mt-[5px] pl-[45px]">
          {player.cards?.map((card, index) => (
            <Card
              key={`${Math.random()}`}
              card={`${card[1]}${card[0]}`}
              xclass="hcard hcard-overlap"
            />
          ))}
        </div>
      </div>
    </>
  );
}

export default Player;
