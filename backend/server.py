from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
import uuid
from fastapi.middleware.cors import CORSMiddleware
import json
from game import Wizard, Player

app = FastAPI()

lobbies_id_map = {}
game_map = {}
connected_players = {}

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
    if join_request.room in lobbies_id_map:
        return join_lobby(join_request)
    else: 
        return create_lobby(join_request)
        
def create_lobby(join_request):
    lobby_id = str(uuid.uuid4())
    wizard = Wizard(lobby_id)
    lobbies_id_map[join_request.room] = lobby_id
    game_map[lobby_id] = wizard
    return lobby_id

def join_lobby(join_request):
    lobby_id = lobbies_id_map[join_request.room]
    return lobby_id

@app.websocket("/ws/lobby/{game_id}")
async def websocket_endpoint(websocket: WebSocket, game_id: str):
    await websocket.accept()
    user_id = websocket.query_params.get("userID")
    connected_players[user_id] = websocket
    messageHandler = MessageHandler()
    print("connected")
    try:
        while True:
            data = await websocket.receive_text()
            wizard = game_map[game_id]
            data = json.loads(data)
            await messageHandler.handle_incoming_message(wizard, data, websocket)
    except WebSocketDisconnect:
        wizard = game_map[game_id]
        print("Client disconnected")
        await messageHandler.handle_disconnect(wizard, user_id)
        
    #except KeyError as e:
    #    print(e)
    #    redirect_msg = json.dumps({"status": 504})
    #    await websocket.send_text(redirect_msg)

class MessageHandler:
    async def handle_incoming_message(self, wizard: Wizard, data, websocket):
        data_type = data["type"]
        if data_type == 0: # User joined
            player = Player(data["player"]["username"], data["player"]["id"], websocket)
            state_changed = wizard.join_game(player)
            if state_changed:
                await self.broadcast_game_state(wizard)
        if data_type == 1: # Game starts
            wizard.start_game()
            await self.broadcast_game_state(wizard)
        if data_type == 2: # Take Guess
            success = wizard.take_guess(data)
            if success:
                await self.broadcast_game_state(wizard)
        if data_type == 3: # Play Card
            success = wizard.play_card(data)
            if success:
                await self.broadcast_game_state(wizard)
        
                
    async def handle_disconnect(self, wizard, user_id):
        wizard.leave_game(user_id)
        await self.broadcast_game_state(wizard)
    
    async def broadcast_game_state(self, wizard: Wizard):
        #print(json.dumps(wizard.game_state()))
        for player in wizard.players:
            payload = wizard.game_state(player)
            #print(payload)
            json_data = json.dumps({"status": 200, "payload": payload})
            await player.websocket.send_text(json_data)
            