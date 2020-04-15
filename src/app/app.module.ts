import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TransactionlistComponent } from './transactionlist/transactionlist.component';
import { OnetransactionComponent } from './onetransaction/onetransaction.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReversePipe } from './reverse.pipe';
import { OneIncomingTransactionComponent } from './one-incoming-transaction/one-incoming-transaction.component';

@NgModule({
  declarations: [
    AppComponent,
    TransactionlistComponent,
    OnetransactionComponent,
    ReversePipe,
    OneIncomingTransactionComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
