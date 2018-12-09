import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoadingIndicatorComponent } from './loading-indicator/loading-indicator.component';
import { ArtistTableRowComponent } from './artist-table-row/artist-table-row.component';
import { TrackTableRowComponent } from './track-table-row/track-table-row.component';
import { TableComponent } from './table/table.component';

@NgModule({
    imports: [
        CommonModule,
    ],
    declarations: [
        LoadingIndicatorComponent,
        TableComponent,
        ArtistTableRowComponent,
        TrackTableRowComponent,
    ],
    exports: [
        LoadingIndicatorComponent,
        TableComponent,
    ],
})
export class SharedModule { }
