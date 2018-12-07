import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoadingIndicatorComponent } from './loading-indicator/loading-indicator.component';
import { ArtistTableRowComponent } from './artist-table-row/artist-table-row.component';
import { TrackTableRowComponent } from './track-table-row/track-table-row.component';

@NgModule({
    imports: [
        CommonModule,
    ],
    declarations: [
        LoadingIndicatorComponent,
        ArtistTableRowComponent,
        TrackTableRowComponent,
    ],
    exports: [
        LoadingIndicatorComponent,
        ArtistTableRowComponent,
        TrackTableRowComponent,
    ],
})
export class SharedModule { }
