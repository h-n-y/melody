import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

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
 * Container component for displaying an artist's top Tracks and Albums
 * on the Artist Details Page.
 */
@Component({
    selector: 'app-artist-details-container',
    templateUrl: './artist-details-container.component.html',
    styleUrls: [ './artist-details-container.component.scss' ]
})
export class ArtistDetailsContainerComponent implements OnInit  {

    private paramsSub: any;
    private artistId: number;

    tracks: Track[] = [];

    // Expose enums to template.
    TableType = TableType;

    get noTracksAvailable(): boolean {
        return this.tracks.length === 0;
    }

    /**
     * Listens for artist tracks returned by the service.
     */
    private listenForArtistTracks() {
        //this.musicService.tracksForArtist$.subscribe((tracks: Track[]) => {
        this.musicService.tracksForArtist$.subscribe((response: {
             available: number, tracks: Track[] }) => {

            const tracks = response.tracks;
            // Check that the tracks indeed belong to the artist.
            const tracksMatchArtist = ( tracks.length && tracks[0].artist_id === this.artistId );
            if ( tracks.length === 0 ) {
                console.log('NO TRACK RESULTS FOR ARTIST');

            } else if ( tracksMatchArtist ) {
                this.tracks = tracks;
            } else {
                console.warn('id mismatch!!');
            }
        });
    }

    /**
     * Fetches tracks for the given artist.
     * @param {number} artistId - The id of the artist.
     */
    private fetchTracksForArtistWithId(artistId: number) {
        this.musicService.fetchTracksForArtistWithId(artistId);
    }

    constructor(private musicService: MusicService,
               private router: Router,
               private route: ActivatedRoute) { }

   /**
    * 'see more' btn click handler.
    */
    onSeeMoreTracksBtnClick() {
        this.router.navigate(['tracks'], { relativeTo: this.route });
    }

    /**
     * Track table row event handler.
     * Navigates to the track details page for the selected track.
     * @param {Track} track - The selected track.
     */
    onTrackSelected(track: Track) {
        const url = '/track/' + track.track_id;
        this.router.navigate([url]);
    }

    //
    // LIFECYCLE HOOKS
    //

    ngOnInit() {

        this.listenForArtistTracks();

        this.paramsSub = this.route.params.subscribe((params) => {
            this.artistId = +params['artistId'];
            this.fetchTracksForArtistWithId(this.artistId);
        });
    }
}
