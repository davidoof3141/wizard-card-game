from fastapi import FastAPI
from pydantic import BaseModel
import uuid
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

lobbies = {}

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your React app's URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class JoinRequest(BaseModel):
    username: str
    room: str

@app.get("/")
async def root():
    return {"message": "Hello Worlds"}

@app.post("/checkin/")
async def checkin(join_request: JoinRequest):
    #lobby_id = str(uuid.uuid4())  # Generate a unique lobby ID
    #lobbies[lobby_id] = Lobby(lobby_id=lobby_id, players=[])
    #return {"lobby_id": lobby_id}
    if join_request.room in lobbies:
        join_lobby(join_request)
    else:
        return create_lobby(join_request)
    return "test"
        
def create_lobby(join_request):
    lobby_id = str(uuid.uuid4())  # Generate a unique lobby ID
    lobbies[join_request.room] = lobby_id
    print(lobbies)
    return lobby_id

def join_lobby(t):
    pass