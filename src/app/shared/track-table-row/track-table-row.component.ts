import { Component, Input } from '@angular/core';

// Interfaces
import {
    Track,
} from '../../interfaces';

/**
 * A table row displaying track info.
 */
@Component({
    selector: 'app-track-table-row',
    templateUrl: './track-table-row.component.html',
    styleUrls: [ 
        '../table-row-styles.scss',
        './track-table-row.component.scss'
    ]
})
export class TrackTableRowComponent  {

    @Input() track: Track;

    // The table row hides the artist name, and moves the album to its position,
    // when this flag is set to true.
    @Input() artistKnown = false;
}
