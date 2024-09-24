import json
import random

class Player:
    def __init__(self, name, id, websocket) -> None:
        self.name = name
        self.id = id
        self.player_id = -1
        self.leader = False
        self.websocket = websocket
        self.cards = []
        self.score = 0
        self.guess = -1
        self.success_guess = 0
        self.played_card = None
        
    def set_leader(self):
        self.leader = True
        
    def get_state(self):
        return {"id": self.player_id, "name": self.name, "cards": self.cards, "score": self.score, "guess": self.guess, "sguess": self.success_guess, "played": self.played_card}
    
    def get_hidden_state(self):
        hidden_cards = [["H", "H"] for card in self.cards]
        return {"id": self.player_id, "name": self.name, "cards": hidden_cards, "score": self.score, "guess": self.guess, "sguess": self.success_guess, "played": self.played_card}
        
class Deck:
    def __init__(self) -> None:
        self.reset()
    
    def reset(self):
        suits = ['h', 'd', 'c', 's']
        ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14']
        jesters = [('J', 'J')]*4
        wizards = [('W', 'W')]*4
        self.cards = [(rank, suit) for suit in suits for rank in ranks] + jesters + wizards
        random.shuffle(self.cards)
        
    def deal(self):
        return self.cards.pop() if self.cards else None

class Wizard:
    """
    state: int; 0 initialized, 1 started, 2 stopped, finished
    """
    def __init__(self, lobby_id: str) -> None:
        self.state = 0
        self.round = 0
        
        self.players = []
        self.lobby_id = lobby_id
        self.table_cards = []
        self.turn = None
        self.game_index = -1
        self.round_index = -1
        
        self.current_turn = None
        self.deck = Deck()
        self.trump = None
        self.played_stack = {} # round_index: card
        self.highest_card_index = -1
        
    def start_game(self):
        self.state = 1
        self.game_index = random.randint(0, len(self.players) - 1)
        self.round_index = self.game_index
        self.next_round()
    
    def take_guess(self, data):
        if data["id"] == self.players[self.round_index].id:
            self.players[self.round_index].guess = data["guess"]
            self.round_index = (self.round_index + 1) % len(self.players)
            if self.players[self.round_index].guess != -1:
                #self.round_index = self.game_index
                self.state = 4 
            return True
    
    def play_card(self, data):
        if data["id"] == self.players[self.round_index].id:
            player = self.players[self.round_index]
            card = parse_card(data["played"])
            player.played_card = card
            player.cards.remove(card)
            self.played_stack[self.round_index] = card
            if len(self.played_stack) == 1:
                self.highest_card_index = self.round_index
            else:
                highest_card = self.played_stack[self.highest_card_index]
                is_higher = compare_cards(card, highest_card, self.trump)
                if is_higher:
                    self.highest_card_index = self.round_index
            self.round_index = (self.round_index + 1) % len(self.players)
            if self.players[self.round_index].played_card:
                self.reset_turn()
                if not self.players[self.round_index].cards:
                    self.calculate_score()
                    self.reset_round()
                    
                
            return True
    
    def reset_turn(self):
        self.players[self.highest_card_index].success_guess += 1
        self.round_index = self.highest_card_index
        self.played_stack = {}
        for player in self.players:
            player.played_card = None
            
    def calculate_score(self):
        for player in self.players:
            if player.success_guess == player.guess:
                player.score += 20 + player.success_guess*10
            else:
                player.score -= abs((player.guess - player.success_guess)*10)
            
    def reset_round(self):
        self.round_index = (self.round_index + 1) % len(self.players)
        for player in self.players:
            player.guess = -1
            player.success_guess = 0
        self.next_round()
    
    def next_round(self):
        self.deck.reset()
        self.deal_cards()
        self.trump = self.deck.deal()
        self.state = 3 # Guessing
        
    def deal_cards(self):
        self.round += 1
        for player in self.players:
            for _ in range(self.round):
                player.cards.append(self.deck.deal())
        
    def join_game(self, player: Player):
        if not any(playerx.id == player.id for playerx in self.players):
            if not self.players:
                player.set_leader()
            player_id = random.randint(1000000, 9999999)
            player.player_id = player_id
            self.players.append(player)
            return self.players
        
    def leave_game(self, user_id):
        print(user_id)
        for i, player in enumerate(self.players):
            if player.id == user_id:
                self.players.pop(i)
                break
            
    def game_state(self, player: Player) -> dict:
        players = [xplayer.get_state() if player.id == xplayer.id else xplayer.get_hidden_state() for xplayer in self.players]
        player_index = self.players.index(player)
        players = players[player_index:] + players[:player_index]
        game_state = {
            "state": self.state,
            "players": players,
            "round": self.round,
            "trump": self.trump
        }
        if self.state in [3,4]:
            game_state["turn"] = self.players[self.round_index].player_id
        return game_state

            
def parse_card(card: str):
    return (card[1:], card[:1])

def compare_cards(card: tuple, card_comparison: tuple, trump: tuple):
    # check color first
    # if compare card is trump
    if card_comparison[0] == "W":
        return False
    if card_comparison[0] == "J":
        if card[0] == "J":
            return False
        else:
            return True
    if card_comparison[1] == card[1]:
        if int(card_comparison[0]) > int(card[0]):
            return False
        else:
            return True
    else:
        if card_comparison[1] == trump[1]:
            return False
        elif card[1] == trump[1]:
            return True
        else:
            return False


    
    