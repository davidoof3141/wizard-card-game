import { useParams } from "react-router-dom";

function Lobby() {
  const { lobbyID } = useParams<{ lobbyID: string }>();
  return (
    <>
      <div
        className="bg-cover bg-center bg-no-repeat h-full"
        style={{ backgroundColor: "#1A2A37" }}
      >
        <div className="background-playground bg-[url('./assets/playground.png')] bg-cover bg-center relative mx-auto top-[6%]"></div>
      </div>
    </>
  );
}

export default Lobby;
