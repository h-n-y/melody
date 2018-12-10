import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TrackDetailsPageComponent } from './track-details-page/track-details-page.component';

const routes: Routes = [
    { path: '', component: TrackDetailsPageComponent },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule],
})
export class TrackRoutingModule { }
