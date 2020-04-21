This is the work-in-progress UI for the frontend part of the SC demo.


The State Channel Demo Scenario:

Alice wants to gamble. She opens a website, negotiates some channel opening params (initial amounts for example) and gets a QR code to scan with her phone/continues in the browser. Using this QR code she opens a state channel with the casino. In the SC context, the casino plays the role of a responder. Its node has a backend that handles its logic and keys. The backend authenticates or refuses to authenticate incoming requests.

Alice gets a list of possible games via generic messages. Each game is a smart contract. Alice goes with a simple turn based game (discuss the game down). She offers the casino to add this smart contract to the state of their channel. The backend approves/rejects it. If approved they proceed playing the game via smart contract executions.

Game example: coin toss - Hash Locked Smart Contract. The backend produces a Sophia string - either head or tails. It encodes it and gives the produced hash to the smart contract. All Alice sees is a hash and she has to guess if it is a head or tails. If she does not answer until the time runs out - the casino can force progress this on-chain and claim their reward. If Alice says head/tails - it is the casino's turn to provide the hash and unlock the mystery. If it refuses to do so, after the timer runs out, Alice can force progress it on-chain and claim her reward. If the hash is provided, someone gets the reward in a civilized manner.