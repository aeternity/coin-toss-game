import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {SdkService} from '../sdk.service'

enum State {
  initial = 'initial',
  channelCreated = 'channelCreated',
  contractCreated = 'contractCreated',
  hashInserted = 'hashInserted',
  bidPlaced = 'bidPlaced',
  won = 'won',
  lost = 'lost',
  error = 'error',
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

  state: State;
  stateEnum: typeof State = State;
  private contractAddress;
  private guess;

  constructor(private sdkService: SdkService, private changeDetectorRef: ChangeDetectorRef) {
    this.state = State.initial;
  }

  updateState(newState: State):void {
    this.state = newState;
    this.changeDetectorRef.detectChanges();
  }

  async setGuess(guess: string) {
    try {
      console.log(guess);
      this.guess = guess;
      const callRes = await this.sdkService.channel.contractCall('player_pick', this.contractAddress, [`"${guess}"`], {amount: 10});
      this.updateState(State.bidPlaced);
    } catch (err) {
      console.log(err);
      this.updateState(State.error);
    }
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
        this.updateState(State.channelCreated)

        // channel.disconnect();
        // await channel.reconnect();

        // Block all channel operations util contract is created
        this.contractAddress = await channel.awaitContractCreate();
        console.log('--------------- Contract Deployed ---------------', this.contractAddress);
        this.updateState(State.contractCreated)

        const BackendSetHash = await channel.awaitContractCall('provide_hash');
        console.log('--------------- Backend set the hash ---------------', BackendSetHash);
        this.updateState(State.hashInserted)
        // Make a contract call (provide a coin side)
        // Wait of `reveal`
        const RevealByBackend = await channel.awaitContractCall('reveal');
        console.log('--------------- Backend call reveal ---------------', RevealByBackend);
        if(RevealByBackend.decoded.arguments[1].value === this.guess) this.updateState(State.won)
        else this.updateState(State.lost)

        const shutdown = await channel.closeChannel();
        console.log('--------------- Channel shutdown complete ---------------', shutdown);
      });
    }).catch(e => {
      console.log(e);
      this.updateState(State.error)
    });
  }

  ngOnInit() {
    this.initChannelAndWaitForContract();
  }
}
