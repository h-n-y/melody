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
    @Input() items: Track[] | Artist[] = [];

    // Table name appearing above the table rows.
    @Input() title = '';

    // Controls whether the table rows display the artist name.
    // The artist name is hidden if the table is displayed on the Artist Details Page,
    // where the artist is already known.
    @Input() artistKnown = false;

    @Input() seeMoreBtnVisible = false;
    @Input() loadMoreBtnVisible = false;

    @Input() loading = false;

    @Output() seeMore = new EventEmitter<void>();
    @Output() loadMore = new EventEmitter<void>();

    onSeeMoreBtnClick() {
        this.seeMore.emit();
    }

    onLoadMoreBtnClick() {
        this.loadMore.emit();
    }
}
