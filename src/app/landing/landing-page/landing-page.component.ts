import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

// Enums
import {
    TableType,

    TabCategory
} from '../../enums';

// Interfaces
import {
    Track,
    Artist,
} from '../../interfaces';

// Services
import { MusicService } from '../../services/music.service';
import { ModalService } from '../../services/modal.service';

const USE_MUSIXMATCH = true;

/**
 * The home page of the application.
 * Displays a list of popular tracks and artists.
 */
@Component({
    templateUrl: './landing-page.component.html',
    styleUrls: [ './landing-page.component.scss' ]
})
export class LandingPageComponent implements OnInit, AfterViewInit  {

    // Expose enums to template.
    TableType = TableType;

    // Flags indicating whether or not a search is in progress.
    searchingArtists = false;
    searchingTracks = false;

    popularArtists: Artist[] = [];
    popularTracks: Track[] = [];

    activeTab = TabCategory.All;

    /**
     * @returns `true` iff the current tab is 'All' or 'Artists'
     */
    get artistsVisible(): boolean {
        const category = this.activeTab;
        return category === TabCategory.All ||
                category === TabCategory.Artists;
    }

    /**
     * @returns `true` iff the current tab is 'All' or 'Tracks'
     */
    get tracksVisible(): boolean {
        const category = this.activeTab;
        return category === TabCategory.All ||
                category === TabCategory.Tracks;
    }

    /**
     * Subscribes to music service for popular artist updates.
     */
    private listenForPopularArtists() {
        this.musicService.popularArtists$.subscribe((res) => {
            this.searchingArtists = false;
            this.popularArtists = res;
        });
    }

    /**
     * Subscribes to music service for popular tracks updates.
     */
    private listenForPopularTracks() {
        this.searchingTracks = false;
        this.musicService.popularTracks$.subscribe((res) => {
            this.searchingTracks = false;
            this.popularTracks = res;
        });
    }

    /**
     * Requests the music service to fetch popular tracks and sets the
     * corresponding search flag.
     */
    private fetchPopularTracks() {
        this.searchingTracks = true;
        this.musicService.fetchPopularTracks();
    }

    /**
     * Requests the music service fetch popular artists and sets the
     * corresponding search flag.
     */
    private fetchPopularArtists() {
        //const self = this;
        this.searchingArtists = true;
        this.musicService.fetchPopularArtists();
    }

    /**
     * Displays the welcome modal if it has not yet been displayed.
     */
    private conditionallyDisplayWelcomeModal() {
        const notDisplayedYet = !this.modalService.welcomeModalDisplayed;
        if ( notDisplayedYet ) {
            this.modalService.displayWelcomeModal();
        }
    }

    constructor(private musicService: MusicService,
               private modalService: ModalService,
               private router: Router) { }

    /**
     * Sets the current active tab. Called when a tab is clicked.
     * @param category - The category of the clicked tab.
     */
    onTabSelected(category: TabCategory) {
        this.activeTab = category;
    }

    /**
     * Navigates to the Artist Details page for the selected artist.
     * Called when user clicks on an artist table row.
     * @param artist - The selected artist.
     */
    onArtistSelected(artist: Artist) {
        const url = '/artist/' + artist.artist_id;
        this.router.navigate([url]);
    }

    /**
     * Navigates to the Track Details page for the selected track
     * Called when user clicks on a track table row.
     * @param track - The selected track.
     */
    onTrackSelected(track: Track) {
        const url = '/track/' + track.track_id;
        this.router.navigate([url]);
    }

    //
    // LIFECYCLE HOOKS
    //

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

    ngAfterViewInit() {
        this.conditionallyDisplayWelcomeModal();
    }
}
