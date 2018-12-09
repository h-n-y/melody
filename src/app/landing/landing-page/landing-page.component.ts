import { Component, OnInit } from '@angular/core';

// Enums
import {
    TableType,
} from '../../enums';

// Interfaces
import {
    Track,
    Artist,
} from '../../interfaces';

// Services
import { MusicService } from '../../services/music.service';

const USE_MUSIXMATCH = false;

@Component({
    templateUrl: './landing-page.component.html',
    styleUrls: [ './landing-page.component.scss' ]
})
export class LandingPageComponent implements OnInit  {

    // Expose enums to template.
    TableType = TableType;

    searchingArtists = false;
    searchingTracks = false;

    popularArtists: Artist[] = [];
    popularTracks: Track[] = [];

    /**
     * Subscribes to music service for popular artist updates.
     */
    private listenForPopularArtists() {
        this.musicService.popularArtists$.subscribe((res) => {
            this.searchingArtists = false;
            console.log('**************');
            console.log('Artists:');
            console.log(res);
            //const list = res.message.body.artist_list;
            const artist_list = res;
            artist_list.forEach((artist) => {
                console.log(artist.artist_rating);
            });

            this.popularArtists = res;
        });
    }

    private listenForPopularTracks() {
        this.searchingTracks = false;
        this.musicService.popularTracks$.subscribe((res) => {
            this.searchingTracks = false;
            this.popularTracks = res;

            console.log('tracks!');
            console.log(res);
        });
    }

    private fetchPopularTracks() {
        this.searchingTracks = true;
        this.musicService.fetchPopularTracks();
    }

    private fetchPopularArtists() {
        //const self = this;
        this.searchingArtists = true;
        this.musicService.fetchPopularArtists();
    }

    constructor(private musicService: MusicService) { }

    ngOnInit() {
        this.listenForPopularArtists();
        this.listenForPopularTracks();

        // conditional for development only.
        // set to false to save API calls
        if ( USE_MUSIXMATCH ) {
            this.fetchPopularTracks();
            this.fetchPopularArtists();
        }
    }
}
