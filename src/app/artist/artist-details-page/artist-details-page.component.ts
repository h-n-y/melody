import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

// Interfaces
import {
    Artist,
    Track,
} from '../../interfaces';

// Services
import { MusicService } from '../../services/music.service';
import { ModalService } from '../../services/modal.service';

/**
 * Artist Details Page
 *
 * Displays the name and tracks of a particular artist.
 *
 */
@Component({
    templateUrl: './artist-details-page.component.html',
    styleUrls: [ './artist-details-page.component.scss' ]
})
export class ArtistDetailsPageComponent implements OnInit  {

    private paramsSub: any; // route params subscription reference

    private artistId: number;   // the id of the displayed artist

    artist: Artist; // the displayed artist

    /**
     * Requests the MusicService fetch the artist with the associated id.
     * @param artistId The id of the requested artist.
     */
    private fetchArtistForId(artistId: number) {
        this.musicService.fetchArtistForId(artistId);
    }
    
    /**
     * Subscribes to the MusicService for artist updates.
     */
    private listenForArtist() {
        this.musicService.artistForId$.subscribe((artist: Artist) => {

            // make sure the artist id matches the query parameter id.
            const artistMatchesId = ( artist.artist_id === this.artistId );
            if ( artistMatchesId ) {
                console.log('SUCCESS ( artist )');
                console.log(artist);
                this.artist = artist;


                window.localStorage.setItem('artist', JSON.stringify(artist));

            }
        });
    }


    /**
     * Scrolls the page to the top whenever a presented modal is dismissed.
     * Makes for a better UX.
     */
    private listenForModalDismissal() {
        this.modalService.announceModalDismissal$.subscribe(() => {
            document.body.scrollTop = 0;
        });
    }

    constructor(private musicService: MusicService,
                private modalService: ModalService,
                private router: Router,
                private route: ActivatedRoute) { }

    // TODO: remove
    onArtistNameClick() {
        this.router.navigate(['artist/' + this.artistId]);
    }

    ngOnInit() {

        this.artist = JSON.parse(window.localStorage.getItem('artist')) || [];


        this.listenForArtist();

        this.listenForModalDismissal();
        
        // Listen for the artistId parameter and fetch the artist
        // with that id.
        this.paramsSub = this.route.params.subscribe((params) => {
            this.artistId = +params['artistId'];
            this.musicService.setCurrentArtistId(this.artistId);
            this.fetchArtistForId(this.artistId);
        });

    }

    ngOnDestroy() {
        this.paramsSub.unsubscribe();
        this.musicService.clearCurrentArtistId();
    }
}
