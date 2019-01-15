import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from './core/core.module';
import { ModalModule } from './modal/modal.module';

import { AppComponent } from './app.component';

// Services
import { MusicService } from './services/music.service';
import { DOMService } from './services/dom.service';
import { ModalService } from './services/modal.service';

// Entry Components ( modals )
import { WelcomeModalComponent } from './modal/welcome-modal/welcome.modal.component';
import { SearchModalComponent } from './modal/search-modal/search.modal.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    HttpClientJsonpModule,
    AppRoutingModule,
    CoreModule,
    ModalModule,
  ],
  providers: [
      MusicService, 
      DOMService,
      ModalService,
  ],
  entryComponents: [
      WelcomeModalComponent,
      SearchModalComponent,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
