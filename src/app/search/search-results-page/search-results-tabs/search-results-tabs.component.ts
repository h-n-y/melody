import { Component, Input, Output, EventEmitter } from '@angular/core';

// Enums
import {
    SearchCategory,
} from '../../../enums';

/*
enum Tab {
    All = 'All',
    Artists = 'Artists',
    Tracks = 'Tracks',
    Lyrics = 'Lyrics',
}
*/

@Component({
    selector: 'app-search-results-tabs',
    templateUrl: './search-results-tabs.component.html',
    styleUrls: [ './search-results-tabs.component.scss' ]
})
export class SearchResultsTabsComponent  {

    // Expose enum to template.
    SearchCategory = SearchCategory;

    @Input() category: SearchCategory;
    @Input() numArtists: number;
    @Input() numTracks: number;
    @Input() numLyrics: number;

    @Output() allSelected = new EventEmitter<void>();
    @Output() artistsSelected = new EventEmitter<void>();
    @Output() tracksSelected = new EventEmitter<void>();
    @Output() lyricsSelected = new EventEmitter<void>();

    get allTabCount(): number | string {
        if ( this.numArtists && this.numTracks && this.numLyrics ) {
            return this.numArtists + this.numTracks + this.numLyrics;
        }

        return '-';
    }

    get artistTabCount(): number | string {
        return this.numArtists || '-';
    }

    get trackTabCount(): number | string {
        return this.numTracks || '-';
    }

    get lyricsTabCount(): number | string {
        return this.numLyrics || '-';
    }

    onTabClick(tabCategory: SearchCategory) {
        switch( tabCategory ) {
            case SearchCategory.All:
                this.allSelected.emit();
                break;

            case SearchCategory.Artists:
                this.artistsSelected.emit();
                break;

            case SearchCategory.Tracks:
                this.tracksSelected.emit();
                break;

            case SearchCategory.Lyrics:
                this.lyricsSelected.emit();
                break;

        }
    }
}
