import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// Enums
import {
    TableType,
} from '../../../enums';

// Interfaces
import {
    Track,
} from '../../../interfaces';

// Services
import { MusicService } from '../../../services/music.service';

/**
 * A container component for displaying artist tracks on the
 * Artist Details Page.
 */
@Component({
    selector: 'app-artist-tracks-container',
    templateUrl: './artist-tracks-container.component.html',
    styleUrls: [ './artist-tracks-container.component.scss' ]
})
export class ArtistTracksContainerComponent implements OnInit {


    private artistId: number;

    // Make enums available to template.
    TableType = TableType;

    readonly pageSize = 30;
    pageNumber = 1;

    // The total number of tracks available from the API.
    // The 'load more' button remains visible until the number of
    // loaded tracks reaches this number.
    // Value set on the first api response, which provides the number.
    numTracksAvailable = 0;

    // `true` as long as more tracks from the artist can be fetched from
    // the api
    moreTracksAvailable = true;
    loadingTracks = false;

    tracks: Track[] = [];

    /**
     * Listens for artist tracks returned by the appropriate MusicService observable.
     */
    private listenForTracks() {
        this.musicService.tracksForArtist$.subscribe((res: { available: number, tracks: Track[] }) => {
            // stops loading animation
            this.loadingTracks = false;

            this.numTracksAvailable = res.available;
            this.tracks = this.tracks.concat(res.tracks);
        });
    }

    /**
     * Fetches tracks for the current artist.
     * Increments page count for next fetch.
     *
     */
    private fetchTracks() {

        this.musicService.fetchTracksForArtistWithId(
            this.artistId,
            this.pageNumber,
            this.pageSize);

        // increment page number for next api request
        ++this.pageNumber;

        // Update the track availability flag.
        const numAvailableTracksFlagHasBeenSet = this.numTracksAvailable;
        if ( numAvailableTracksFlagHasBeenSet ) {
            this.moreTracksAvailable = ( this.pageNumber * this.pageSize <= this.numTracksAvailable )
        }
    }

    constructor(private router: Router,
                private musicService: MusicService) { }

    /**
     * 'load more' btn click handler
     *  Requests an additional fetch of tracks from the api
     */
    onLoadMoreBtnClick() {
        if ( this.moreTracksAvailable ) {
            this.fetchTracks();
        } else {
            console.log('--- NO MORE TRACKS AVAILABLE ---');
        }
    }

    /**
     * Track table row click handler.
     * Navigate to the track details page for the selected track.
     * @param {Track} track - The selected track.
     */
    onTrackSelected(track) {
        const url = '/track/' + track.track_id;
        this.router.navigate([url]);
    }

    //
    // LIFECYCLE HOOKS
    //

    ngOnInit() {
        this.listenForTracks();

        this.artistId = this.musicService.getCurrentArtistId();
        this.fetchTracks();
    }
}
