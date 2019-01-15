import { Component, Input } from '@angular/core';

// Interfaces
import {
    Artist,
} from '../../interfaces';

/**
 * Artist Table Row
 *
 * Displays artist data in a table row.
 */
@Component({
    selector: 'app-artist-table-row',
    templateUrl: './artist-table-row.component.html',
    styleUrls: [
        '../table-row-styles.scss',
        './artist-table-row.component.scss'
    ]
})
export class ArtistTableRowComponent  {

    @Input() artist: Artist;
}
