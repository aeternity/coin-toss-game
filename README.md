# Installation: 

1. To use the Coin Toss State Channel Demo, you first need to install and the AE Channel Service which also provides you with a very basic setup of an Aeternity node with a local private network and some prefunded accounts. The AE Channel Service will serve as an automated counterpart that will play the Coin Toss Game against you: https://github.com/aeternity/ae-channel-service . Mac Users: For the first build, you might increase the RAM allocated to your docker in the docker desktop menu to at least 2,5 GB of free memory.

2. Clone this repo and run:

```
$ npm install -g @angular/cli

$ npm install

$ ng serve
```
then open http://localhost:4200/

Note: The current state of the demo depicts only the "happy path". In case of errors, restart the Node and Channel service (here eventualls delete the `data` folder) and reload the site.

The application automatically points to your Aeternity Node and AE Channel service at localhost. If you're running them on another host, you can change the according values at `src/environments/environment.ts `

In case of questions, issues and featur requests, please turn to https://forum.aeternity.com/ .

# About the game:

Short description, steps marked with (*) require co-signing, that is; signature by both participants 
```
1. channels is opened (*)
2. backend provides contract (*)
3. player provides a stake N tokens and a hash `compute_hash` based on guess which is heads|tails, and the secret key (salt) (*)
4. backend makes a coin_side guess with `casino_pick` and also provides N tokens to be able to participate (*)
5. client reveals `reveal` by prividing key (salt) and the selected coin_side, tokens are now redistributed (*)
6. goto 3 ( ) or shutdown (*) which return tokens on-chain
```

Description of the final (!) game by Dimitar (progressing in steps might be smart):

```
Alice wants to gamble. She opens a website, negotiates some channel opening params (initial amounts for example) 
and gets a QR code to scan with her phone/continues in the browser. Using this QR code she opens a state channel 
with the casino. In the SC context, the casino plays the role of a responder. Its node has a backend that handles 
its logic and keys. The backend authenticates or refuses to authenticate incoming requests.

Alice gets a list of possible games via generic messages. Each game is a smart contract. Alice goes with a simple 
turn based game (discuss the game down). She offers the casino to add this smart contract to the state of their 
channel. The backend approves/rejects it. If approved they proceed playing the game via smart contract executions.

Game example: coin toss - Hash Locked Smart Contract. The backend produces a Sophia string - either head or tails. 
It encodes it and gives the produced hash to the smart contract. All Alice sees is a hash and she has to guess if 
it is a head or tails. If she does not answer until the time runs out - the casino can force progress this on-chain 
and claim their reward. If Alice says head/tails - it is the casino's turn to provide the hash and unlock the mystery. 
If it refuses to do so, after the timer runs out, Alice can force progress it on-chain and claim her reward. If the 
hash is provided, someone gets the reward in a civilized manner.
```
