import { Component, Input, Output, EventEmitter } from '@angular/core';

// Enums
import {
    TableType,
} from '../../enums';

// Interfaces
import {
    Track,
    Artist,
} from '../../interfaces';

/**
 * A generic table component for displaying Tracks, Artists, and Albums.
 */
@Component({
    selector: 'app-table',
    templateUrl: './table.component.html',
    styleUrls: [ './table.component.scss' ]
})
export class TableComponent  {

    // Expose enum to template.
    TableType = TableType;

    @Input() tableType: TableType;
    @Input() items: Track[] | Artist[] = []; // the items to display in the table

    // Table name appearing above the table rows.
    @Input() title = '';

    // Controls whether the table rows display the artist name.
    // The artist name is hidden if the table is displayed on the Artist Details Page,
    // where the artist is already known.
    @Input() artistKnown = false;

    // Flags for button visibility
    @Input() seeMoreBtnVisible = false;
    @Input() loadMoreBtnVisible = false;

    @Input() loading = false;

    // Button click event emitters
    @Output() seeMore = new EventEmitter<void>();
    @Output() loadMore = new EventEmitter<void>();

    // Table row selection event emitters
    @Output() trackSelected  = new EventEmitter<Track>();
    @Output() artistSelected = new EventEmitter<Artist>();

    /**
     * Emits a button click event.
     * Called when user clicks the 'See More' button.
     */
    onSeeMoreBtnClick() {
        this.seeMore.emit();
    }

    /**
     * Emits a button click event.
     * Called when user clicks the 'Load More' button.
     */
    onLoadMoreBtnClick() {
        this.loadMore.emit();
    }

    /**
     * Track selection event.
     * Called when user clicks on a track table row.
     */
    onTrackSelected(track: Track) {
        this.trackSelected.emit(track);
    }

    /**
     * Artist selection event.
     * Called when user clicks on an artist table row.
     */
    onArtistSelected(artist: Artist) {
        this.artistSelected.emit(artist);
    }
}
