import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {SdkService} from '../sdk.service'

enum State {
  initial = 'initial',
  channelCreated = 'channelCreated',
  contractCreated = 'contractCreated',
  hashInserted = 'hashInserted',
  bidPlaced = 'bidPlaced',
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

  private state: State;
  stateEnum: typeof State = State;
  private contractAddress;

  constructor(private sdkService: SdkService, private changeDetectorRef: ChangeDetectorRef) {
    this.state = State.initial;
  }

  updateState(newState: State):void {
    this.state = newState;
    this.changeDetectorRef.detectChanges();
  }

  async setGuess(guess: string) {
    try {
      const callRes = await this.sdkService.channel.contractCall('player_pick', this.contractAddress, [`"${guess}"`], {amount: 1000});
      this.state = State.bidPlaced;
    } catch (err) {
      console.log(err);
      this.updateState(State.error);
    }
  }

  initChannelAndWaitForContract() {
    const txTypes = []; // [ 'signedTx' ]
    this.sdkService.initChannel([]).then(async (channel) => {

      // On onChain Tx
      channel.onChainTx.subscribe(({tx, unpacked, info}) => {
        console.log('---------- OnChainTx: ', unpacked);
      });
      // On error
      channel.error.subscribe(({error}) => {
        console.log('---------- On Error ', error);
      });
      // On new state
      channel.state.subscribe(({unpacked, state}) => {
        console.log('---------- New state: ', unpacked);
      });
      // On new status
      channel.status.subscribe((status) => {
        console.log('---------- New status: ', status);
      });
      // Subscribe for signing of specific transactions type
      // Or another transactions will be signed automatically
      channel.onSign(txTypes).subscribe(({unpacked, accept, deny, networkId, tag}) => {
        console.log('---------- Channel signing -----------');
        console.log('Channel sign networkId: ' + networkId);
        console.log('Channel sign tag -> ' + tag);
        console.log('Channel sign transaction: ', unpacked);
        console.log('---------------------------------------');
        accept();
      });
      // On opened callback
      channel.onOpened(async () => {
        console.log('--------------- Channel Opened On-Chain ---------------');
        this.updateState(State.channelCreated)

        // Block all channel operations util contract is created
        console.log('--------------- Contract Deployed ---------------');
        this.contractAddress = await this.sdkService.channel.awaitContractCreate();

        this.updateState(State.contractCreated)
        // Make a contract call
      });
    }).catch(e => {
      console.log(e);
      this.state = State.error;
      this.changeDetectorRef.detectChanges();

    });
  }

  ngOnInit() {
    this.initChannelAndWaitForContract();
  }
}
