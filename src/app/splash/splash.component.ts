import {Component, OnInit} from '@angular/core';
import {SdkService} from '../sdk.service'

enum State {
  loading = 'loading',
  deposit = 'deposit',
  error = 'error',
  ready = 'ready',
  running = 'running',
  finished = 'finished',
}

enum ChannelState {
  initial = 'initial',
  channelCreated = 'channelCreated',
  contractCreated = 'contractCreated',
  hashInserted = 'hashInserted',
  bidPlaced = 'bidPlaced',
}

@Component({
  selector: 'app-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss']
})
export class SplashComponent implements OnInit {

  private state: State;
  private channelState: ChannelState;
  stateEnum: typeof State = State;
  channelStateEnum: typeof ChannelState = ChannelState;

  constructor(private sdkService: SdkService) {
    this.state = State.loading;
    this.channelState = ChannelState.initial;
  }

  initChannelAndWaitForContract() {
    this.sdkService.initChannel({
      signFunction: ({tag, unpackedTx}, cb) => {
        console.log("signing function", tag, unpackedTx)
        // handle contract calls wrt round
        if (tag === 'initiator_sign') this.channelState = ChannelState.channelCreated;

        if (tag === "update_ack" && unpackedTx.tx.updates[0].txType === "channelOffChainCreateContract")
          this.channelState = ChannelState.contractCreated

        if (tag === "update_ack" && unpackedTx.tx.updates[0].txType === "channelOffChainCallContract") {
          console.log(this.sdkService.channel.$channel.round())
          switch (this.sdkService.channel.$channel.round()) {
            case 2:
              console.log("Inserting Hash");
              this.state = State.ready;
              this.channelState = ChannelState.hashInserted
              break;
            case 3:
              // DO BETTING
              break;
          }
        }

        return cb();
      }
    }).then(async (channel) => {
      channel.onOpened(async () => {
        // Block all channel operations util contract is created
        await channel.awaitContractCreate();
      });
    }).catch(e => {
      console.error(e);
    });
  }

  signTx() {

  }

  ngOnInit() {
    this.initChannelAndWaitForContract();
  }
}
