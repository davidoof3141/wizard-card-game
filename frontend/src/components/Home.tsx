import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      console.log(JSON.stringify({ username, room }));
      const response = await fetch("http://localhost:8000/checkin/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, room }),
      });

      if (response.ok) {
        const lobbyId = await response.json();
        console.log(lobbyId);
        navigate(`/lobby/${lobbyId}`);
      } else {
        console.error("Failed to create lobby");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <>
      <div
        className="background bg-cover bg-center bg-no-repeat h-full"
        style={{
          backgroundImage: "url('./src/assets/background/background.jpg')",
        }}
      >
        <h1 className="text-3xl font-bold">Wizard</h1>
        <div className="container">
          <form onSubmit={handleSubmit}>
            <div className="login_box">
              <input
                type="text"
                id="fname"
                name="fname"
                className="login_input"
                placeholder="USERNAME"
                value={username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setUsername(e.target.value)
                }
                required
              ></input>
              <input
                type="text"
                id="fname"
                name="fname"
                className="login_input"
                placeholder="ROOM"
                value={room}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setRoom(e.target.value)
                }
                required
              ></input>
              <button className="button-48" role="button">
                <span className="text">Play</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default Home;
