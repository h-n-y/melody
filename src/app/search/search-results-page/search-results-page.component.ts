import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

// Enums
import {
    SearchCategory,
    TableType,
} from '../../enums';

// Interfaces
import {
    Artist,
    Track,
} from '../../interfaces';

// Services
import { MusicService } from '../../services/music.service';

// The number of results returned by the api for a single 'page'
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE = 1;

/**
 * Page for displaying search results.
 */
@Component({
    templateUrl: './search-results-page.component.html',
    styleUrls: [ './search-results-page.component.scss' ]
})
export class SearchResultsPageComponent implements OnInit  {

    // Expose enums to template.
    TableType = TableType;
    SearchCategory = SearchCategory;

    query = '';
    searchCategory: SearchCategory;

    searchResults = {
        artists: {
            apiPageNum: 1,
            apiMaxPageNum: -1,
            list: []
        },
        tracks: {
            apiPageNum: 1,
            apiMaxPageNum: -1,
            list: []
        },
        lyrics: {
            apiPageNum: 1,
            apiMaxPageNum: -1,
            list: []
        },
    };

    get artistsVisible(): boolean {
        const category = this.searchCategory;
        return category === SearchCategory.All ||
                category === SearchCategory.Artists;
    }

    get tracksVisible(): boolean {
        const category = this.searchCategory;
        return category === SearchCategory.All ||
                category === SearchCategory.Tracks;
    }

    get lyricsVisible(): boolean {
        const category = this.searchCategory;
        return category === SearchCategory.All ||
                category === SearchCategory.Lyrics;
    }

    get moreArtistResultsAvailable(): boolean {
        // check that the most recently requested page is not the
        // last available page
        const artists = this.searchResults.artists;
        return artists.apiPageNum < artists.apiMaxPageNum;
    }

    get moreTrackResultsAvailable(): boolean {
        // check that the most recently requested page is not the
        // last available page
        const tracks = this.searchResults.tracks;
        return tracks.apiPageNum < tracks.apiMaxPageNum;
    }

    get moreLyricsResultsAvailable(): boolean {
        // check that the most recently requested page is not the
        // last available page
        const lyrics = this.searchResults.lyrics;
        return lyrics.apiPageNum < lyrics.apiMaxPageNum;
    }

    /**
     * Performs a search on the search string when it's received and sets
     * the corresponding search category. These values are set as query parameters
     * in the url.
     */
    private listenForQueryParameters() {
        this.route.queryParams.subscribe(params => {
            console.log('QUERY PARAMETERS');
            console.log(params);

            this.searchCategory = params.category;


            // If query has changed, search:
            const query = params.queryString;
            if ( query !== this.query ) {
                this.searchForQuery(query);
            }

            this.query = query;
            

            // development only
            //this.getResultsFromLocalStorage();
        });
    }

    /**
     * Subscribes to updates on search results for artists.
     * @param query The search string to match against.
     */
    private listenForArtistSearchResults(query: string, page: number = DEFAULT_PAGE) {
        console.log('page is ' + page);
        this.musicService.searchArtists(query, page).subscribe(response => {
            console.log('artist results');

            const newArtists = response.message.body.artist_list.map(obj => obj.artist);
            console.log(newArtists);
            window.localStorage.setItem('searchPageArtists', JSON.stringify(newArtists));

            // concatenate artists to existing list
            const artistList = this.searchResults.artists.list;
            this.searchResults.artists.list = artistList.concat(newArtists);

            // Set max page count for this request
            const needToSetMaxPageSize = this.searchResults.artists.apiMaxPageNum === -1;
            if ( needToSetMaxPageSize ) {
                this.searchResults.artists.apiMaxPageNum = this.numAvailablePagesForResponse(response);
            }

        });
    }

    /**
     * Subscribes to updates on search results for tracks.
     * @param query The search string to match against.
     */
    private listenForTrackSearchResults(query: string, page: number = DEFAULT_PAGE) {
        this.musicService.searchTracks(query, page).subscribe(response => {
            console.log('tracks results');
            console.log(response);

            const newTracks = response.message.body.track_list.map(obj => obj.track);
            window.localStorage.setItem('searchPageTracks', JSON.stringify(newTracks));

            // concatenate tracks to existing list
            const trackList = this.searchResults.tracks.list;
            this.searchResults.tracks.list = trackList.concat(newTracks);

            // Set max page count for this request
            const needToSetMaxPageSize = this.searchResults.tracks.apiMaxPageNum === -1;
            if ( needToSetMaxPageSize ) {
                this.searchResults.tracks.apiMaxPageNum = this.numAvailablePagesForResponse(response);
            }
        });
    }

    /**
     * Subscribes to updates on search results for lyrics.
     * @param query The search string to match against.
     */
    private listenForLyricsSearchResults(query: string, page: number = DEFAULT_PAGE) {
        this.musicService.searchLyrics(query, page).subscribe(response => {
            console.log('lyrics results');
            console.log(response);

            const newTrackLyrics = response.message.body.track_list.map(obj => obj.track);
            window.localStorage.setItem('searchPageLyrics', JSON.stringify(newTrackLyrics));
            
            // concatenate lyrics to existing list
            const lyricsList = this.searchResults.lyrics.list;
            this.searchResults.lyrics.list = lyricsList.concat(newTrackLyrics);

            // Set max page count for this request
            const needToSetMaxPageSize = this.searchResults.lyrics.apiMaxPageNum === -1;
            if ( needToSetMaxPageSize ) {
                this.searchResults.lyrics.apiMaxPageNum = this.numAvailablePagesForResponse(response);
            }
        });
    }

    /**
     * Searches for Artists, Tracks, and Lyrics matching the query string.
     * @param query The search string to match against.
     */
    private searchForQuery(query: string) {
        this.listenForArtistSearchResults(query);
        this.listenForTrackSearchResults(query);
        this.listenForLyricsSearchResults(query);
    }

    //
    // DEVELOPMENT ONLY
    //
    private getResultsFromLocalStorage() {
        const artists = JSON.parse(window.localStorage.getItem('searchPageArtists'));
        const tracks = JSON.parse(window.localStorage.getItem('searchPageTracks'));
        const lyrics = JSON.parse(window.localStorage.getItem('searchPageLyrics'));

        this.searchResults.artists.list = artists;
        this.searchResults.tracks.list = tracks;
        this.searchResults.lyrics.list = lyrics;

        this.searchResults.artists.apiMaxPageNum = 1;
        this.searchResults.tracks.apiMaxPageNum = 1;
        this.searchResults.lyrics.apiMaxPageNum = 1;
    }

    /**
     * Used for determining how many pages can be requested from the api
     * for artist, track, or lyrics responses.
     * @param response - The api response whose max page count we want.
     */
    private numAvailablePagesForResponse(response: any): number {
        const size = response.message.header.available;
        return ( size / DEFAULT_PAGE_SIZE ) + ( size % DEFAULT_PAGE_SIZE )
    }

    constructor(private route: ActivatedRoute,
                private router: Router,
                private musicService: MusicService) { }

    onArtistSelected(artist: Artist) {
        const url = '/artist/' + artist.artist_id;
        this.router.navigate([url]);
    }

    onTrackSelected(track: Track) {
        const url = '/track/' + track.track_id;
        this.router.navigate([url]);
    }

    onLyricsSelected(trackLyrics: Track) {
        const url = '/track/' + trackLyrics.track_id;
        this.router.navigate([url]);
    }

    onAllTabSelected() {
        console.log('All Tab');
        //this.searchCategory = SearchCategory.All;
        this.router.navigate(['/search'], {
            queryParams: {
                queryString: this.query,
                category: SearchCategory.All
            }
        });
    }

    onArtistTabSelected() {
        console.log('Artist Tab');
        //this.searchCategory = SearchCategory.Artists;
        this.router.navigate(['/search'], {
            queryParams: {
                queryString: this.query,
                category: SearchCategory.Artists
            }
        });
    }

    onTrackTabSelected() {
        console.log('Track Tab');
        //this.searchCategory = SearchCategory.Tracks;
        this.router.navigate(['/search'], {
            queryParams: {
                queryString: this.query,
                category: SearchCategory.Tracks
            }
        });
    }

    onLyricsTabSelected() {
        console.log('Lyrics Tab');
        //this.searchCategory = SearchCategory.Lyrics;
        this.router.navigate(['/search'], {
            queryParams: {
                queryString: this.query,
                category: SearchCategory.Lyrics
            }
        });
    }

    /**
     * Loads additional items for the current search category.
     * Called when user hits the 'Load More' button at the bottom of
     * a results table.
     */
    onLoadMoreBtnClick() {
        console.log('load more');
        console.log(this.searchCategory);
        const query = this.query;

        let page;
        switch ( this.searchCategory ) {
            
            case SearchCategory.All:
                // noop
                break;

            case SearchCategory.Tracks:
                page = ++this.searchResults.tracks.apiPageNum;
                this.listenForTrackSearchResults(query, page);
                break;

            case SearchCategory.Artists:
                page = ++this.searchResults.artists.apiPageNum;
                this.listenForArtistSearchResults(query, page);
                break;

            case SearchCategory.Lyrics:
                page = ++this.searchResults.lyrics.apiPageNum;
                this.listenForLyricsSearchResults(query, page);
                break;
        }

        console.log('page = ', page);
    }

    ngOnInit() {
        this.listenForQueryParameters();
    }
}
