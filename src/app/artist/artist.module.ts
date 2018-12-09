import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { ArtistRoutingModule } from './artist-routing.module';

import { ArtistDetailsPageComponent } from './artist-details-page/artist-details-page.component';
import { ArtistDetailsContainerComponent } from './artist-details-page/artist-details-container/artist-details-container.component';
import { ArtistTracksContainerComponent } from './artist-details-page/artist-tracks-container/artist-tracks-container.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        ArtistRoutingModule,
    ],
    declarations: [
        ArtistDetailsPageComponent,
        ArtistDetailsContainerComponent,
        ArtistTracksContainerComponent,
    ],
})
export class ArtistModule { }
