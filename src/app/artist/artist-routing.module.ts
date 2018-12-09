import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ArtistDetailsPageComponent } from './artist-details-page/artist-details-page.component';
import { ArtistDetailsContainerComponent } from './artist-details-page/artist-details-container/artist-details-container.component';
import { ArtistTracksContainerComponent } from './artist-details-page/artist-tracks-container/artist-tracks-container.component';


const routes: Routes = [
    {
        path: ':artistId',
        component: ArtistDetailsPageComponent,
        children: [
            { path: '', component: ArtistDetailsContainerComponent },
            { path: 'tracks', component: ArtistTracksContainerComponent },
        ]
    },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    declarations: [],
    exports: [RouterModule],
})
export class ArtistRoutingModule { }
