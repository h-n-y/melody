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

    private listenForArtistTracks() {
        this.musicService.tracksForArtist$.subscribe((tracks: Track[]) => {
            console.log('checking...');
            // Check that the tracks indeed belong to the artist.
            const tracksMatchArtist = ( tracks.length && tracks[0].artist_id === this.artistId );
            if ( tracksMatchArtist ) {
                console.log('SUCCESS ( tracks )');
                console.log(tracks);
                this.tracks = tracks;


                console.warn('dev code');
                window.localStorage.setItem('tracks', JSON.stringify(tracks));
            }
        });
    }

    private fetchTracksForArtistWithId(artistId: number) {
        this.musicService.fetchTracksForArtistWithId(artistId);
    }

    constructor(private musicService: MusicService,
               private router: Router,
               private route: ActivatedRoute) { }

    onSeeMoreTracksBtnClick() {
        console.log('see more tracks');
        this.router.navigate(['tracks'], { relativeTo: this.route });
    }

    ngOnInit() {

        this.tracks = JSON.parse(window.localStorage.getItem('tracks')) || [];

        this.paramsSub = this.route.params.subscribe((params) => {
            this.artistId = +params['artistId'];
            this.fetchTracksForArtistWithId(this.artistId);
        });
    }
}
