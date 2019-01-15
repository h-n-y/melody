import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    { path: 'home', loadChildren: './landing/landing.module#LandingModule' },
    { path: 'artist', loadChildren: './artist/artist.module#ArtistModule' },
    { path: 'track/:trackId', loadChildren: './track/track.module#TrackModule' },
    { path: 'search', loadChildren: './search/search.module#SearchModule' },
    { path: '', redirectTo: 'home', pathMatch: 'full' },
];

@NgModule({
    imports: [ RouterModule.forRoot(routes) ],
    exports: [ RouterModule ]
})
export class AppRoutingModule {
}
