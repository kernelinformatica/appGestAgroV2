import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';

import { HTTP } from '@awesome-cordova-plugins/http/ngx';
//------------ PIPES DE LA APLICACION ------------//
import { CurrencyFormat} from './pipes/currencyformat';
import { NumeroFormat } from './pipes/numeroformat';
import { KilosFormat } from './pipes/kilosformat';


@NgModule({
  declarations: [
    AppComponent,
    CurrencyFormat,
    KilosFormat,
    NumeroFormat
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
  ],
  providers: [
    HTTP,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule { }