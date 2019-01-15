import { Component, Input, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { debounceTime, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

// Services
import { MusicService } from '../../services/music.service';

// Interfaces
import {
    Track,
    Lyrics,
    Artist,
} from '../../interfaces';

// Enums
import {
    TableType,
    SearchCategory,
} from '../../enums';

/**
 * Search Modal
 *
 * Displays a search bar for user to enter search queries and presents
 * the results of those queries.
 *
 */
@Component({
    templateUrl: './search.modal.component.html',
    styleUrls: [ './search.modal.component.scss' ]
})
export class SearchModalComponent implements OnInit, AfterViewInit {

    // Event listener for scrolling on the search results element.
    // Adds a box shadow to the search bar if the search results are scrolled
    // any amount down and removes otherwise.
    private handleScroll = ((e) => {
        console.log(e.target.scrollTop); 
        const scroll = e.target.scrollTop;
        this.searchBarShadowVisible = ( scroll > 0 );

    }).bind(this);

    // Expose enums to template.
    TableType = TableType;

    // Reference to the search bar <input>
    // Needed to focus on the search bar when the modal loads.
    @ViewChild('searchBar') searchBar: ElementRef;

    // Reference to the <div> that contains all the search results.
    // Needed to ascertain the scroll position to conditionally add the
    // box shadow to the search bar.
    @ViewChild('searchResults') searchResultsElement: ElementRef;

    // Dismisses this modal when called. Provided by the modal service.
    @Input() dismiss: () => void;

    // Flag for controlling search bar box shadow visibility
    searchBarShadowVisible = false;

    // Flags indicating which categories are awaiting responses from http requests
    // for the most recent search query.
    searching = {
        artists: false,
        tracks: false,
        lyrics: false
    };

    query = ''; // the user-entered search query

    artists: Artist[] = []; // artists whose name match the search query
    tracks: Track[] = [];   // tracks whose title matches the search query
    lyrics: Track[] = [];   // tracks whose lyrics match the search query

    /**
     * @returns `true` iff any of the search flags are set to true.
     */
    get searchInProgress(): boolean {
        return this.searching.artists ||
                this.searching.tracks ||
                this.searching.lyrics;
    }

    get searchIndicatorLabel(): string {

        return '';

    }

    /**
     * @returns `true` iff any search results have been received.
     */
    get resultsExist(): boolean {
        return this.artists.length || this.tracks.length || this.lyrics.length;
    }

    /**
     * Requests the music service to search for artist matching the query.
     * @param query - The query to match artists against.
     * @returns An Observable that can be subscribed to for search results.
     */
    private listenForArtistSearchResults(query: string): Observable<any> {
        if ( query ) {
            return this.musicService.searchArtists(query);
        }

        return [];
    }

    /**
     * Requests the music service to search for tracks matching the query.
     * @param query - The query to match tracks against.
     * @returns An Observable that can be subscribed to for search results.
     */
    private listenForTrackSearchResults(query: string): Observable<any> {
        if ( query ) {
            return this.musicService.searchTracks(query);
        }

        return [];
    }

    /**
     * Requests the music service to search for lyrics matching the query.
     * @param query - The query to match lyrics against.
     * @returns An Observable that can be subscribed to for search results.
     */
    private listenForLyricsSearchResults(query: string): Observable<any> {
        if ( query ) {
            return this.musicService.searchLyrics(query);
        }

        return [];
    }

    /**
     * The primary method for processing search results. Called in ngOnInit.
     *
     * Listens to the search form input observable with a debounce time of 500ms and
     * then makes search requests to the music service for those input values.
     */
    private listenForSearchQueryResults() {

        // Debounce time is one half second.
        // see: https://github.com/ReactiveX/rxjs/issues/3723

        // The observable associated with the value in the search bar.
        const searchQueryObservable = this.searchForm.get('searchQuery').valueChanges;
        

        // reset the search flags for each new query
        searchQueryObservable.pipe(debounceTime(500)).subscribe(query => {
            console.log(query);

            this.query = query.trim();

            if ( this.query ) {
                this.searching.artists = true;
                this.searching.tracks = true;
                this.searching.lyrics = true;
            } else {
                // ignore query if it's an empty string
                this.searching.artists = false;
                this.searching.tracks = false;
                this.searching.lyrics = false;

                this.artists = [];
                this.tracks = [];
                this.lyrics = [];
            }
        });

        // Artists
        searchQueryObservable.pipe(debounceTime(500))
            .pipe(switchMap(query => this.listenForArtistSearchResults(query.trim())))
            .subscribe(response => {
                console.log('--- ARTIST ---');
                console.log(response);

                // get artists and save a copy
                const artists = response.message.body.artist_list.map(obj => obj.artist);
                this.artists = artists.map(artist => Object.assign({}, artist));
                this.searching.artists = false;
                console.log('=');
                console.log(this.artists);

                // save artists for future queries
                this.musicService.cacheArtists(this.artists)

                window.localStorage.setItem('searchArtists', JSON.stringify(this.artists));
            });


        // Tracks
        searchQueryObservable.pipe(debounceTime(500))
            .pipe(switchMap(query => this.listenForTrackSearchResults(query.trim())))
            .subscribe(response => {
                console.log('--- TRACK ---');
                console.log(response);

                const tracks = response.message.body.track_list.map(obj => obj.track);
                this.tracks = tracks.map(track => Object.assign({}, track));
                this.searching.tracks = false;
                console.log('******');
                console.log(this.tracks);

                // TODO: cache tracks
                window.localStorage.setItem('searchTracks', JSON.stringify(this.tracks));
            });

        // Lyrics
        searchQueryObservable.pipe(debounceTime(500))
            .pipe(switchMap(query => this.listenForLyricsSearchResults(query.trim())))
            .subscribe(response => {
                console.log('--- LYRICS ---');
                console.log(response);

                const lyrics = response.message.body.track_list.map(obj => obj.track);
                this.lyrics = lyrics.map(track => Object.assign({}, track));
                this.searching.lyrics = false;


                window.localStorage.setItem('searchLyrics', JSON.stringify(this.lyrics));
            });

    }

    /**
     * Set the focus on the search bar.
     * Called after view initialization so user doesn't have to waste a click
     * focusing the search bar manually.
     */
    private focusSearchBar() {
        this.searchBar.nativeElement.focus();
    }

    // development only
    private loadDataFromLocalStorage() {
        this.artists = JSON.parse(window.localStorage.getItem('searchArtists'));
        this.tracks = JSON.parse(window.localStorage.getItem('searchTracks'));
        this.lyrics = JSON.parse(window.localStorage.getItem('searchLyrics'));
    }

    /**
     * Navigates to the Search Results page for the given parameters.
     * @param query - The query whose results are to be given.
     * @param searchCategory - The initial search category the Search Results page should display.
     */
    private navigateToSearchResultsPage(query: string, searchCategory: SearchCategory) {
        this.router.navigate(['/search'], {
            queryParams: {
                queryString: query,
                category: searchCategory 
            }});
    }

    /**
     * Navigates to the Track Details page for the given track.
     * @param track - The track to be presented in the details page.
     */
    private navigateToTrackDetailsPage(track: Track) {
        const url = '/track/' + track.track_id;
        this.router.navigate([url]);
    }

    constructor(private musicService: MusicService,
               private router: Router) { }

    // A form wrapper for the search bar.
    searchForm = new FormGroup({
        searchQuery: new FormControl(''),
    });

    onSubmitQuery() {
    }

    /**
     * Navigates to the Search Results page for artists.
     * Called after user clicks the 'see more' button on top of the Artists table.
     */
    onSeeMoreArtistsBtnClick() {
        console.log('see more artists');
        const query = this.query;
        this.navigateToSearchResultsPage(query, SearchCategory.Artists);

        this.dismiss();
    }

    /**
     * Navigates to the Search Results page for tracks.
     * Called after user clicks the 'see more' button on top of the Tracks table.
     */
    onSeeMoreTracksBtnClick() {
        console.log('see more tracks');
        const query = this.query;
        this.navigateToSearchResultsPage(query, SearchCategory.Tracks);

        this.dismiss();
    }

    /**
     * Navigates to the Search Results page for lyrics.
     * Called after user clicks the 'see more' button on top of the Lyrics table.
     */
    onSeeMoreLyricsBtnClick() {
        console.log('see more lyrics');
        const query = this.query;
        this.navigateToSearchResultsPage(query, SearchCategory.Lyrics);

        this.dismiss();
    }

    /**
     * Navigates to the Search Results page for *all* results ( Artists, Tracks, and Lyrics )
     * Called after user clicks the 'See All Results' button at the bottom of the modal.
     */
    onSeeAllResultsBtnClick() {
        console.log('see all results');
        const query = this.query;
        this.navigateToSearchResultsPage(query, SearchCategory.All);

        this.dismiss();
    }

    /**
     * Navigates to the Artist Details page for the given artist.
     * Called when user clicks one of the artist table rows in the search results.
     * @param artist - The selected artist.
     */
    onArtistSelected(artist: Artist) {
        console.log(artist);
        const url = '/artist/' + artist.artist_id;
        this.router.navigate([url]);

        this.dismiss();
    }

    /**
     * Navigates to the Track Details page for the given track.
     * Called when user clicks one of the track table rows in the search results.
     * @param track - The selected track.
     */
    onTrackSelected(track: Track) {
        console.log(track);
        this.navigateToTrackDetailsPage(track);

        this.dismiss();
    }

    /**
     * Navigates to the Track Details page for the given track lyrics.
     * Called when user clicks one of the lyrics table rows in the search results.
     * @param lyricsTrack - The selected lyrics track.
     */
    onLyricsSelected(lyricsTrack: Track) {
        console.log(lyricsTrack);
        this.navigateToTrackDetailsPage(lyricsTrack);

        this.dismiss();
    }

    //
    // Lifecycle Hooks
    //

    ngOnInit() {
        //this.loadDataFromLocalStorage();
        this.listenForSearchQueryResults();
    }

    ngAfterViewInit() {
        this.focusSearchBar();

        this.searchResultsElement.nativeElement.addEventListener('scroll', this.handleScroll);
    }
}

