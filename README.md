# Step by step tutorial for the coin-toss game

# Installation: 

1. To use the Coin Toss State Channel Demo, you need to perform the following steps before cloning this repo and working with it:
a. Run an aeternity node
- You can run a local aeternity node. You can choose to run a node on your local machine or you can use docker to run the node. You can also run it on another machine but you may have to change some settings in the ae-channel-service if you do so.
- [Here](https://blog.aeternity.com/why-run-an-ae-node-and-how-to-do-it-8b95a685f683) is an article that describes how to run your own node.
- While running the node, it is important to understand that your node should have access to the WebSocket endpoint (by default it lives on 127.0.0.1:3014). If you run a docker image, you must provide a proper setup to expose it out of the docker. Note that by default it is bound to the localhost of the docker image.
- In order to enforce the websocket endpoint opening at 3014, you can use either of the following .yaml files for your node configuration:
[Aeterninty Node Fast Test Config](https://github.com/aeternity/ae-channel-service/blob/master/test/aeternity_node_fast_test_config.yml)
or
[Aeterninty Node Normal Test Config](https://github.com/aeternity/ae-channel-service/blob/master/test/aeternity_node_normal_test_config.yml)

- Here is an example command on how to run your aeternity node using docker and mounting your .yaml file:
docker run -p 3013:3013 -p 3014:3014 -p 3015:3015 \
    -v ~/.aeternity/maindb:/home/aeternity/node/data/mnesia \
    -v ~/.aeternity/myaeternity.yaml:/home/aeternity/.aeternity/aeternity/aeternity.yaml \
    aeternity/aeternity

- Once your node is up and running, you will also need to create accounts. In real life that would be the result of the ICO(accounts) but for the test you can set your own.
How can you set the accounts?
Inside your node directory(the node that you are running), you will find a file called `accounts_test.json` under the path  `/node/data/aecore/.genesis`
You can replace the `accounts_test.json` with [this](https://github.com/aeternity/ae-channel-service/blob/master/test/accounts_test.json) file.

The above json has public keys indicating the accounts as well as their balance in aettos.

b. You need to install and run the AE Channel Service. The AE Channel Service will serve as an automated counterpart that will play the Coin Toss Game against you. Follow [this link](https://github.com/aeternity/ae-channel-service) to install and run the ae-channel-service. Mac Users: For the first build, you might increase the RAM allocated to your docker in the docker desktop menu to at least 2,5 GB of free memory([Here](https://github.com/gyan0890/coin-toss-game/blob/coin-toss-steps-update/src/assets/img/docker_memory.png?raw=true) is a screeenshot of the docker properties).
For the first time, the ae-channel-service may take a little longer to build. Depending on your machine capacity and your background processes, sometime it may take upto 6-8 hours but patience is the key. Once you start running this, it would become faster eventually.

c. You can run the test on various environments: mainnet, testnet or locally as an independent node mining on its own. You must configure your ae-channel-service properly so it can sign your transactions for you. Sadly, the demo client does not do that so you must fill your key pair here. If you’re running a local standalone test, you must configure your accounts_test.json accordingly.

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

3. You can run the test on various environments: mainnet, testnet or locally as an independent node mining on its own. For each of the environments, you must configure your ae-channel-service properly so it can sign your transactions for you.

4. Depending on your setup, you must configure your network_id depending on the environment

5. For the node config files:
Examples of config files can be found in the ae-channel-service repo. There are two different setups: the difference between them is simply if the node mines with a normal speed or much faster (the config files are linked in 1a). Please note that if you want iris enabled, you shall add a corresponding line in the `hard_forks` section.

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
NOTE: This bounty was sponsored by the AE Crypto Foundation.
