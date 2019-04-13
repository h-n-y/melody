import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, from } from 'rxjs';

enum SearchCategory {
    Artist,
    Track,
    Lyrics
}

// Interfaces
import {
    Track,
    Artist,
    Lyrics,
} from '../interfaces';

// Musixmatch API constants
const BASE_URL = 'https://api.musixmatch.com/ws/1.1/';
const API_KEY = 'bf81b6270df9af232988d9041cd95074';
const API_KEY_PARAMETER = 'apikey=' + API_KEY;
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const JSONP_CALLBACK_NAME = 'callback';

/**
 * A service for fetching music data from the musixmatch API.
 */
@Injectable()
export class MusicService {

    // Popular tracks and artists are cached so as to reduce API call count.
    private popularTracks: Track[] = [];
    private popularArtists: Artist[] = [];

    // Cache for all artists acquired so far from API requests.
    // Requests for an artist will first check this array to see if the artist has been
    // loaded already before making an API call.
    private allArtistsSoFar: Artist[] = [];

    // Cache for all tracks by artist acquired so far from API requests.
    private tracksByArtistId: { artistId: number, tracks: Track[] }[] = [];

    // Cache for all lyrics acquired so far from API requests.
    private allLyricsSoFar: { trackId: number, lyrics: Lyrics }[] = [];

    // This id is set whenever user navigates to or from the Artist Details page. I'm using this property to
    // circumvent an issue where components of child routes of the Artist Details page don't have access
    // to the parent :artistId route parameter, which is required when fetching tracks and albums belonging
    // to the artist.
    // Note: -1 is considered an invalid id.
    private currentArtistId = -1;

    //
    // Observable sources
    //

    private popularTracksSource = new Subject<Track[]>();
    private popularArtistsSource = new Subject<Artist[]>();
    // Subscribed to by Artist Details Page after requesting a specific artist
    private artistForIdSource = new Subject<Artist>();
    private tracksForArtistSource = new Subject<Track[] |
                                                { available: number, tracks: Track[] }>();
    // Subscribed to by Track Details Page
    private trackForIdSource = new Subject<Track>();
    private trackLyricsForIdSource = new Subject<Lyrics>(); // lyrics for associated track id

    private searchingArtistsSource = new Subject<boolean>();
    private searchingTracksSource = new Subject<boolean>();
    private searchingLyricsSource = new Subject<boolean>();

    //
    // Observable streams
    //

    popularTracks$ = this.popularTracksSource.asObservable();
    popularArtists$ = this.popularArtistsSource.asObservable();
    artistForId$ = this.artistForIdSource.asObservable();
    tracksForArtist$ = this.tracksForArtistSource.asObservable();
    trackForId$ = this.trackForIdSource.asObservable();
    trackLyricsForId$ = this.trackLyricsForIdSource.asObservable();

    // Flag streams used for conditionally displaying search modal loading indicator.
    searchingArtists$ = this.searchingArtistsSource.asObservable();
    searchingTracks$ = this.searchingTracksSource.asObservable();
    searchingLyrics$ = this.searchingLyricsSource.asObservable();


    /**
     * Adds all tracks in `tracksToCache` that have not yet been cached to
     * the `tracksByArtistId` array.
     * @param artistId The id of the tracks' artist.
     * @param tracksToCache The tracks that need to be cached.
     */
    private cacheTracksForArtist(artistId: number, tracksToCache: Track[]) {
        let artist = this.tracksByArtistId.find((item) => item.artistId === artistId);
        if ( !artist ) {
            artist = { artistId, tracks: [] };
            this.tracksByArtistId.push(artist);
        }

        tracksToCache.forEach((track: Track) => {
            const index = artist.tracks.findIndex((track: Track) => track.artist_id === artistId);
            const needToCache = ( index === -1 );
            if ( needToCache ) {
                const trackCopy = Object.assign({}, track);
                artist.tracks.push(trackCopy);
            }
        });
    }

    /**
     * Fetches popular tracks from the musixmatch API.
     */
    private jsonpFetchPopularTracks() {

        // Make the API call only if the popular tracks have not been previously fetched,
        // or if the count is zero.
        const needToCallAPI = ( this.popularTracks.length === 0 );
        if ( needToCallAPI ) {
            const urlBase = BASE_URL + 'track.search?';
            const urlParameters = API_KEY_PARAMETER + '&' +
                'f_has_lyrics=true&' +
                's_track_rating=desc&' +
                'format=jsonp';
            const url = urlBase + urlParameters;

            // JSONP request
            this.http.jsonp(url, JSONP_CALLBACK_NAME).subscribe((res: any) => {

                // cache and add the tracks to the stream
                const track_list = res.message.body.track_list;
                this.popularTracks = track_list.map((item) => item.track);
                const tracksCopy = this.popularTracks.map((track: Track) => Object.assign({}, track));
                this.popularTracksSource.next(tracksCopy);
            });
        } else {
            // API has already been called - just add the cached copy to the stream.
            const tracksCopy = this.popularTracks.map((track: Track) => Object.assign({}, track));
            this.popularTracksSource.next(tracksCopy);
        }
    }
    
    /**
     * Fetches popular artists from the musixmatch API.
     */
    private jsonpFetchPopularArtists() {

        // Make the API call only if the popular artists have not been previously fetched,
        // or if the count is zero.
        const needToCallAPI = ( this.popularArtists.length === 0 );
        if ( needToCallAPI ) {
            // build url
            const urlBase = BASE_URL + 'artist.search?';
            const urlParameters = API_KEY_PARAMETER + '&' +
                's_artist_rating=desc&' +
                'format=jsonp';
            const url = urlBase + urlParameters;
            
            // JSONP request
            this.http.jsonp(url, JSONP_CALLBACK_NAME).subscribe((res: any) => {

                // cache and add the artists to the stream
                const artist_list = res.message.body.artist_list;
                this.popularArtists = artist_list.map((item) => item.artist);
                const artistsCopy = this.popularArtists.map((artist: Artist) => Object.assign({}, artist));
                this.popularArtistsSource.next(artistsCopy)

                // Cache the artists to reduce quantity of future API calls.
                this.cacheArtists(this.popularArtists);
            });
        } else {

            // If api has already been called, just add the cached copy to the stream.
            const artistsCopy = this.popularArtists.map((artist: Artist) => Object.assign({}, artist));
            this.popularArtistsSource.next(artistsCopy);

            // Cache the artists to reduce quantity of future API calls.
            this.cacheArtists(this.popularArtists);
        }
    }

    /**
     * Fetches data for the artist with the given id.
     * @param {number} artistId - The id of the artist.
     */
    private jsonpFetchArtistForId(artistId: number) {

        const urlBase = BASE_URL + 'artist.get?';
        const urlParameters = API_KEY_PARAMETER + '&' +
            'artist_id=' + artistId + '&' +
            'format=jsonp';
        const url = urlBase + urlParameters;

        this.http.jsonp(url, JSONP_CALLBACK_NAME).subscribe((res: any) => {

            const artist: Artist = res.message.body.artist;
            this.cacheArtists([artist]);
            this.artistForIdSource.next(artist);
        });
    }

    /**
     * Fetches track data for the given artist.
     * @param {number} artistId - The id of the artist.
     * @param {number} page - The desired reponse page.
     * @param {number} pageSize - The number of results to return for each page.
     */
    private jsonpFetchTracksForArtistWithId(artistId: number, page: number = DEFAULT_PAGE, pageSize: number = DEFAULT_PAGE_SIZE) { 
        const urlBase = BASE_URL + 'track.search?';
        const urlParameters = API_KEY_PARAMETER + '&' +
            'f_artist_id=' + artistId + '&' +
            'f_has_lyrics=true&' +
            's_track_rating=desc&' +
            'format=jsonp&' +
            'page=' + page + '&' +
            'page_size=' + pageSize;
        const url = urlBase + urlParameters;


        this.http.jsonp(url, JSONP_CALLBACK_NAME).subscribe((res: any) => {

            const tracks: Track[] = res.message.body.track_list.map((item) => item.track);
            this.cacheTracksForArtist(artistId, tracks);
            //this.tracksForArtistSource.next(tracks);
            this.tracksForArtistSource.next({
                available: res.message.header.available,    // total number of available tracks
                tracks                                      // a subset of the available tracks returned by this response
            });
        });
    }

    /**
     * Fetches data for a particular track.
     * @param {number} trackId - The id of the track.
     */
    private jsonpFetchTrackWithId(trackId: number) {
        const urlBase = BASE_URL + 'track.get?';
        const urlParameters = API_KEY_PARAMETER + '&' +
            'track_id=' + trackId + '&' +
            'format=jsonp';
        const url = urlBase + urlParameters; 

        this.http.jsonp(url, JSONP_CALLBACK_NAME).subscribe((res: any) => {
            const track: Track = res.message.body.track;
            this.trackForIdSource.next(track)

            window.localStorage.setItem('track', JSON.stringify(track));
        });
    }

    /**
     * Fetches the lyrics for the given track.
     * @param {number} trackId - The id of the track whose lyrics are being fetched.
     */
    private jsonpFetchLyricsForTrackWithId(trackId: number) {
        const urlBase = BASE_URL + 'track.lyrics.get?';
        const urlParameters = API_KEY_PARAMETER + '&' +
            'track_id=' + trackId + '&' +
            'format=jsonp';
        const url = urlBase + urlParameters;

        this.http.jsonp(url, JSONP_CALLBACK_NAME).subscribe((res: any) => {
            const lyrics: Lyrics = res.message.body.lyrics;
            // TODO: cache lyrics
            this.trackLyricsForIdSource.next(lyrics);
        });
    }
    
    /**
     * Generic musixmatch API search function. Requests the API to return results for the given query and search category.
     * @param {string} query - The search query typed by the user.
     * @param {SearchCategory} category - The search category. Categories are 'Artists', 'Tracks', and 'Lyrics'.
     * @param {number} page - The API response page to return.
     * @returns An observable stream providing the response to the search request.
     */
    private search(query: string, category: SearchCategory, page: number = DEFAULT_PAGE): Observable<object> {

        // Build the url for the search query:
        let urlBase,
            urlParameters = API_KEY_PARAMETER + '&' + 'page=' + page + '&page_size=' + DEFAULT_PAGE_SIZE;
        switch ( category ) {

            // Artist Search
            case SearchCategory.Artist:
                urlBase = BASE_URL + 'artist.search?';
                urlParameters += '&' +
                    'q_artist=' + query + '&' +
                    'format=jsonp';
                break;

            // Track or Lyrics Search
            case SearchCategory.Track:
            case SearchCategory.Lyrics:
                const queryParameter = ( category === SearchCategory.Track ? 'q_track=' : 'q_lyrics=' );

                urlBase = BASE_URL + 'track.search?';
                urlParameters += '&' +
                    queryParameter + query + '&' +
                    's_artist_rating=desc&' +
                    's_track_rating=desc&' +
                    'f_has_lyrics=true&' +
                    'format=jsonp';
                break;
        }

        const url = urlBase + urlParameters;

        return this.http.jsonp(url, JSONP_CALLBACK_NAME);
    }

    constructor(private http: HttpClient) { }

    /**
     * Adds all artists in `artists` that have not yet been cached
     * to the `allArtistsSoFar` array.
     * @param artists The artists to cache.
     */
    cacheArtists(artists: Artist[]) {

        artists.forEach((artist: Artist) => {

            // First check if artist has already been added.
            const artistId = artist.artist_id;
            const index = this.allArtistsSoFar.findIndex((artist: Artist) => {
                return artist.artist_id === artistId;
            });

            // Add the artist if necessary.
            const needToCache = ( index === -1 );
            if ( needToCache ) {
                const artistCopy = Object.assign({}, artist);
                this.allArtistsSoFar.push(artistCopy);
            }
        });
    }

    /**
     * Requests artists for the given search query.
     * @param {string} query - The search query typed by the user.
     * @param {number} page - The desired API response page.
     * @returns An observable providing the response to the request.
     */
    searchArtists(query: string, page: number = DEFAULT_PAGE): Observable<any> {
        return this.search(query, SearchCategory.Artist, page);
    }

    /**
     * Requests tracks for the given search query.
     * @param {string} query - The search query typed by the user.
     * @param {number} page - The desired API response page.
     * @returns An observable providing the response to the request.
     */
    searchTracks(query: string, page: number = DEFAULT_PAGE): Observable<any> {
        return this.search(query, SearchCategory.Track, page);
    }

    /**
     * Requests lyrics for the given search query.
     * @param {string} query - The search query typed by the user.
     * @param {number} page - The desired API response page.
     * @returns An observable providing the response to the request.
     */
    searchLyrics(query: string, page: number = DEFAULT_PAGE): Observable<any> {
        return this.search(query, SearchCategory.Lyrics, page);
    }

    /**
     * @returns The musixmatch id of the artist currently displayed on the page.
     */
    getCurrentArtistId(): number {
        return this.currentArtistId;
    }

    /**
     * Updates the id of the currently-displayed artist.
     * @param {number} artistId - The id of the current artist.
     */
    setCurrentArtistId(artistId: number) {
        const invalidId = artistId < 0;
        if ( invalidId ) {
            console.warn(artistId, ' is not a valid artist id');
            return;
        }

        this.currentArtistId = artistId;
    }

    /**
     * Clears out the current artist id.
     */
    clearCurrentArtistId() {
        this.currentArtistId = -1;
    }

    /**
     * Request popular tracks from the musixmatch API.
     */
    fetchPopularTracks() {
        this.jsonpFetchPopularTracks();
    }

    /**
     * Request popular artists from the musixmatch API.
     */
    fetchPopularArtists() {
        this.jsonpFetchPopularArtists();
    }


    /**
     * Requests data for the artist with the given id.
     * @param {number} artistId - The id of the artist.
     */
    fetchArtistForId(artistId: number) {
        // First, check if artist has previously been fetched.
        let artist: Artist = this.allArtistsSoFar.find((artist: Artist) => artist.artist_id === artistId);
        if ( artist ) {
            /* TODO */ 
            console.log('&&& cached artist &&&');
        }

        // Artist not cached. Make the API call.
        this.jsonpFetchArtistForId(artistId);
    }

    /**
     * Requests track data for the given artist.
     * @param {number} artistId - The id of the artist.
     * @param {number} pageNumber - The desired API response page.
     * @param {number} pageSize - The desired size of each API response page.
     */
    fetchTracksForArtistWithId(artistId: number, pageNumber: number = DEFAULT_PAGE, pageSize: number = DEFAULT_PAGE_SIZE) {

        /*
        // Check cache first.
        const artist = this.tracksByArtistId.find((item) => item.artistId === artistId);
        if ( artist ) {
            this.tracksForArtistSource.next(artist.tracks);
            return;
        }
       */

        this.jsonpFetchTracksForArtistWithId(artistId, pageNumber, pageSize);
    }


    /**
     * Request data for the track with the given id.
     * @param {number} trackId - The id of the track.
     */
    fetchTrackWithId(trackId: number) {
        this.jsonpFetchTrackWithId(trackId);
    }


    /**
     * Requests lyrics for the track with the given id.
     * @param {number} trackId - The id of the track.
     */
    fetchLyricsForTrackWithId(trackId: number) {
        // TODO:
        // First check if already cached.

        this.jsonpFetchLyricsForTrackWithId(trackId);
    }


    /*
     * TODO: determine if this method is still necessary?
     */
    /**
     * Searches all categories for the given search query.
     * @param {string} query - The search query typed by the user.
     */
    searchAllCategories(query: string) {
        this.searchArtists(query);
        this.searchTracks(query);
        this.searchLyrics(query);
    }



    /**
     * Checks the status code of a musixmatch api response.
     * @param statusCode The status code of the api response.
     * @returns `true` if the request was successful ( i.e. response = 200 )
     */
    statusCodeCheck(statusCode: number): boolean {
        switch ( statusCode ) {
            case 200: return true;

            /**
             * TODO:
             * handle all non-200 status codes
             */

            case 400:
                break;

            case 401:
                break;

            case 402:
                break;

            case 403:
                break;

            case 404:
                break;

            case 405:
                break;

            case 500:
                break;

            case 503:
                break;

            default:

        }

        console.warn('musixmatch api error! Status code ' + statusCode);
        return false;
    }
}
