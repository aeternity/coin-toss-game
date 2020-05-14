import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http'
import { AppRoutingModule } from './app-routing.module';
import { StorageServiceModule } from 'ngx-webstorage-service';
import { AppComponent } from './app.component';
import { TransactionlistComponent } from './transactionlist/transactionlist.component';
import { OnetransactionComponent } from './onetransaction/onetransaction.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReversePipe } from './reverse.pipe';
import { OneIncomingTransactionComponent } from './one-incoming-transaction/one-incoming-transaction.component';
import { OneUpdateComponent } from './one-update/one-update.component';
import { SdkService } from './sdk.service';
import { SplashComponent } from './splash/splash.component';
import {FormsModule} from "@angular/forms";
import { InlineSVGModule } from 'ng-inline-svg';
import {SuiModule} from 'ng2-semantic-ui';


@NgModule({
  declarations: [
    AppComponent,
    TransactionlistComponent,
    OnetransactionComponent,
    ReversePipe,
    OneIncomingTransactionComponent,
    OneUpdateComponent,
    SplashComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    StorageServiceModule,
    FormsModule,
    SuiModule,
    InlineSVGModule.forRoot()
  ],
  providers: [SdkService],
  bootstrap: [AppComponent]
})
export class AppModule { }
