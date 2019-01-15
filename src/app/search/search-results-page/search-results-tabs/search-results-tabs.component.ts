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

/**
 * Tabs for filtering results on the Search Results page.
 */
@Component({
    selector: 'app-search-results-tabs',
    templateUrl: './search-results-tabs.component.html',
    styleUrls: [ './search-results-tabs.component.scss' ]
})
export class SearchResultsTabsComponent  {

    // Expose enum to template.
    SearchCategory = SearchCategory;

    // The current active search ( tab ) category.
    @Input() category: SearchCategory;

    // The number of results for each category.
    @Input() numArtists: number;
    @Input() numTracks: number;
    @Input() numLyrics: number;

    // Event emitters for tab clicks.
    @Output() allSelected = new EventEmitter<void>();
    @Output() artistsSelected = new EventEmitter<void>();
    @Output() tracksSelected = new EventEmitter<void>();
    @Output() lyricsSelected = new EventEmitter<void>();

    /**
     * @returns The total number of results across all categories.
     */
    get allTabCount(): number | string {
        return this.numArtists + this.numTracks + this.numLyrics || '-';

    }

    /**
     * @returns The number of artists results.
     */
    get artistTabCount(): number | string {
        return this.numArtists || '-';
    }

    /**
     * @returns The number of track results.
     */
    get trackTabCount(): number | string {
        return this.numTracks || '-';
    }

    /**
     * @returns The number of lyrics results.
     */
    get lyricsTabCount(): number | string {
        return this.numLyrics || '-';
    }

    /**
     * Emits a click event for the given category.
     * Called when user clicks a tab.
     * @param tabCategory - The category of the clicked tab.
     */
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
