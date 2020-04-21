import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http'
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TransactionlistComponent } from './transactionlist/transactionlist.component';
import { OnetransactionComponent } from './onetransaction/onetransaction.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReversePipe } from './reverse.pipe';
import { OneIncomingTransactionComponent } from './one-incoming-transaction/one-incoming-transaction.component';
import { OneUpdateComponent } from './one-update/one-update.component';
import { SdkService } from './sdk.service';

@NgModule({
  declarations: [
    AppComponent,
    TransactionlistComponent,
    OnetransactionComponent,
    ReversePipe,
    OneIncomingTransactionComponent,
    OneUpdateComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule
  ],
  providers: [SdkService],
  bootstrap: [AppComponent]
})
export class AppModule { }
