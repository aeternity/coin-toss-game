import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {SdkService} from '../sdk.service';

const randomString = (len: number, charSet?: string) => {
  charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return [...Array(len).keys()]
    .reduce(
      (acc, _, i) => {
        const randomPoz = Math.floor(Math.random() * charSet.length);
        return acc.concat(charSet.substring(randomPoz, randomPoz + 1));
      }, '');
};

enum State {
  initial = 'initial',
  channelCreated = 'channelCreated',
  contractCreated = 'contractCreated',
  hashInserted = 'hashInserted',
  bidPlaced = 'bidPlaced',
  lobby = 'lobby',
  won = 'won',
  lost = 'lost',
  error = 'error',
  closed = 'closed',
  ready = 'ready',
  running = 'running',
  finished = 'finished',
}

@Component({
  selector: 'app-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss']
})
export class SplashComponent implements OnInit {

  stake: number;
  state: State;
  stateEnum: typeof State = State;
  balance;
  maxStake = Number.MAX_SAFE_INTEGER;
  private contractAddress;
  private salt: string;
  private guess;
  private showForceProgress = false;

  constructor(private sdkService: SdkService, private changeDetectorRef: ChangeDetectorRef) {
    this.state = State.initial;
  }

  initChannelAndWaitForContract() {
    const txTypes = []; // [ 'signedTx' ]
    this.sdkService.initChannel().then(async (channel) => {

      // On onChain Tx
      channel.onChainTx.subscribe((data) => {
        console.log('---------- OnChainTx: ', data);
      });
      // On error
      channel.error.subscribe((error) => {
        console.log('---------- On Error ', error);
      });
      // On new state
      channel.state.subscribe((state) => {
        console.log('---------- New state: ', state);
      });
      // On new status
      channel.status.subscribe((status) => {
        console.log('---------- New status: ', status);
      });
      // Subscribe for signing of specific transactions type
      // Or another transactions will be signed automaticaly
      channel.onSign(txTypes).subscribe(({ unpacked, accept, deny, tag, updates }) => {
        console.log('---------- Channel signing -----------');
        console.log('Channel sign transaction: ', unpacked);
        console.log('Transaction updates:  ', updates);
        console.log('---------------------------------------');
        accept();
      });
      // On opened callback
      channel.onOpened(async () => {
        console.log('--------------- Channel Opened On-Chain ---------------');
        this.updateState(State.channelCreated);
        // Block all channel operations util contract is created
        this.contractAddress = await channel.awaitContractCreate();
        console.log('--------------- Contract Deployed ---------------', this.contractAddress);
        await this.updateBalance();
        this.updateState(State.contractCreated);
        setTimeout(async () => await this.goToLobby(), 700);
      });
    }).catch(e => {
      console.log(e);
      this.updateState(State.error);
    });
  }

  ngOnInit() {
    this.initChannelAndWaitForContract();
  }

  updateState(newState: State): void {
    this.state = newState;
    this.changeDetectorRef.detectChanges();
  }

  openChannel() {
    this.initChannelAndWaitForContract();
    this.updateState(State.initial);
  }

  startRound() {
    this.salt = null;
    this.guess = null;
    this.updateState(State.hashInserted);
  }

  async goToLobby() {
    const [a, b] = Object.values(await this.sdkService.channel.getBalances());
    this.maxStake = (a > b ? b : a) - (+this.sdkService.channel.channelParams.channelReserve);
    this.updateState(State.lobby);
  }

  async playRound(guess: string) {
    let step = 1;
    try {
      this.guess = guess;
      this.salt = randomString(25);
      const hash = await this.sdkService.channel.contractDryRun('compute_hash', this.contractAddress, [`"${this.salt}"`, `"${guess}"`]);
      // tslint:disable-next-line:max-line-length
      const providedHashResult = await this.sdkService.channel.contractCall('provide_hash', this.contractAddress, [`${hash}`], { amount: this.stake });
      step += 1;
      const casinoPickResult = await this.sdkService.channel.awaitContractCall('casino_pick');
      step += 1;
      const revealRes = await this.sdkService.channel.contractCall('reveal', this.contractAddress,  [`"${this.salt}"`, `"${guess}"`]);
      step += 1;
      await this.updateBalance();
      casinoPickResult.decoded.arguments[0].value !== this.guess ? this.updateState(State.won) : this.updateState(State.lost);
    } catch (err) {
      this.stake = 0;
      this.guess = null;
      this.salt = null;
      switch (step) {
        // Provide hash
        case 1:
          if (err.wsMessage && err.wsMessage.error) {
            const [reason] = err.wsMessage.error.data;
            // Insufficient balance
            if (reason.code === 1001) {
              alert(`Game error: ${reason.message}`);
              await this.goToLobby();
            }
          }
          // Casino insufficient balance
          if (err.errorCode === 555) {
            alert(`Game error: Casino Insufficient balance`);
            await this.goToLobby();
          }
          break;
        // Casino pick
        case 2:
          if (err.reactionTimeExceed) {
            this.showForceProgress = true;
            this.changeDetectorRef.detectChanges();
          }
          break;
        // Reveal
        case 3:
        default:
          console.log(err);
          this.updateState(State.error);
      }
    }
  }
  async forceProgress() {
    const disputRes = await this.sdkService.channel.forceProgress('player_dispute_no_pick', this.contractAddress, []);
    this.goToLobby();
  }

  async closeGame() {
    const shutdown = await this.sdkService.channel.closeChannel();
    console.log('--------------- Channel shutdown complete ---------------', shutdown);
    this.updateState(State.closed);
  }

  async updateBalance() {
    this.balance = (await this.sdkService.channel.getBalances())[this.sdkService.channel.channelParams.initiatorId];
  }
}
