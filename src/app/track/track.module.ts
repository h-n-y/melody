import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrackRoutingModule } from './track-routing.module';

import { TrackDetailsPageComponent } from './track-details-page/track-details-page.component';

@NgModule({
    imports: [
        CommonModule,
        TrackRoutingModule,
    ],
    declarations: [
        TrackDetailsPageComponent,
    ],
})
export class TrackModule { }
