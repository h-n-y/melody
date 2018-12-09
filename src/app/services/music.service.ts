import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
//import axios from 'axios';

// Interfaces
import {
    Track,
    Artist,
} from '../interfaces';

// Musixmatch API constants
const BASE_URL = 'https://api.musixmatch.com/ws/1.1/';
const API_KEY = 'bf81b6270df9af232988d9041cd95074';
const API_KEY_PARAMETER = 'apikey=' + API_KEY;
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

// Development constants
const DEVELOPMENT_MODE = true;
const USING_JSONP = DEVELOPMENT_MODE;

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

    // This id is set whenever user navigates to or from the Artist Details page. I'm using this property to
    // circumvent an issue where components of child routes of the Artist Details page don't have access
    // to the parent :artistId parameter, which is required when fetching tracks and albums belonging
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

    //
    // Observable streams
    //

    popularTracks$ = this.popularTracksSource.asObservable();
    popularArtists$ = this.popularArtistsSource.asObservable();
    artistForId$ = this.artistForIdSource.asObservable();
    tracksForArtist$ = this.tracksForArtistSource.asObservable();

    /**
     * Adds all artists in `artists` that have not yet been cached
     * to the `allArtistsSoFar` array.
     * @param artists The artists to cache.
     */
    private cacheArtists(artists: Artist[]) {

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
            this.http.jsonp(url, 'callback').subscribe((res: any) => {
                console.log('hope this works...');
                console.log(res);

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
            this.http.jsonp(url, 'callback').subscribe((res: any) => {

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

    private jsonpFetchArtistForId(artistId: number) {

        const urlBase = BASE_URL + 'artist.get?';
        const urlParameters = API_KEY_PARAMETER + '&' +
            'artist_id=' + artistId + '&' +
            'format=jsonp';
        const url = urlBase + urlParameters;

        this.http.jsonp(url, 'callback').subscribe((res: any) => {
            console.log('specific artist?');
            console.log(res);

            const artist: Artist = res.message.body.artist;
            this.cacheArtists([artist]);
            this.artistForIdSource.next(artist);
        });
    }

    private jsonpFetchTracksForArtistWithId(artistId: number) {
        this.jsonpFetchTracksForArtistWithId(artistId, DEFAULT_PAGE, DEFAULT_PAGE_SIZE);
    }

    // NOTE: this method very similar to above...
    // only difference is url params
    private jsonpFetchTracksForArtistWithId(artistId: number, page: number, pageSize: number) {
        const urlBase = BASE_URL + 'track.search?';
        const urlParameters = API_KEY_PARAMETER + '&' +
            'f_artist_id=' + artistId + '&' +
            'f_has_lyrics=true&' +
            's_track_rating=desc&' +
            'format=jsonp&' +
            'page=' + page + '&' +
            'page_size=' + pageSize;
        const url = urlBase + urlParameters;

        console.log('URL:' url);

        this.http.jsonp(url, 'callback').subscribe((res: any) => {
            console.log('TRACKS FOR ARTIST', artistId);
            console.log(res);

            const tracks: Track[] = res.message.body.track_list.map((item) => item.track);
            this.cacheTracksForArtist(artistId, tracks);
            //this.tracksForArtistSource.next(tracks);
            this.tracksForArtistSource.next({
                available: res.message.header.available,    // total number of available tracks
                tracks                                      // a subset of the available tracks returned by this response
            });
        });
    }

    constructor(private http: HttpClient) { }

    getCurrentArtistId(): number {
        return this.currentArtistId;
    }

    setCurrentArtistId(artistId: number) {
        const invalidId = artistId < 0;
        if ( invalidId ) {
            console.warn(artistId, ' is not a valid artist id');
            return;
        }

        this.currentArtistId = artistId;
    }

    clearCurrentArtistId() {
        this.currentArtistId = -1;
    }

    fetchPopularTracks() {
        if ( USING_JSONP ) {
            this.jsonpFetchPopularTracks();
            return;
        }

        //const urlBase = BASE_URL + 'track.search?';
        const urlBase = BASE_URL + 'track.search?';
        const urlParameters = API_KEY_PARAMETER + '&' +
            'f_has_lyrics=true&' +
            's_track_rating=desc&' +
            'page_size=15&' +
            'format=json';
        const url = urlBase + urlParameters;

        //return this.getDataAtUrl(url);
    }

    fetchPopularArtists() {
        if ( USING_JSONP ) {
            this.jsonpFetchPopularArtists();
            return;
        }
        const urlBase = BASE_URL + 'track.search?';
        const urlParameters = API_KEY_PARAMETER + '&' +
            'f_has_lyrics=true&' +
            's_artist_rating=desc&' +
            'format=json';
        const url = urlBase + urlParameters;

        //return this.getDataAtUrl(url);
    }


    fetchArtistForId(artistId: number) {
        // First, check if artist has previously been fetched.
        let artist: Artist = this.allArtistsSoFar.find((artist: Artist) => artist.artist_id === artistId);
        if ( artist ) {
            
        }

        // Artist not cached. Make the API call.
        if ( USING_JSONP ) {
            this.jsonpFetchArtistForId(artistId);
        }
    }

    fetchTracksForArtistWithId(artistId: number) {

        /*
        // Check cache first.
        const artist = this.tracksByArtistId.find((item) => item.artistId === artistId);
        if ( artist ) {
            this.tracksForArtistSource.next(artist.tracks);
            return;
        }
       */

        if ( USING_JSONP ) {
            this.jsonpFetchTracksForArtistWithId(artistId);
        }
    }

    fetchTracksForArtistWithId(artistId: number, page: number, pageSize: number) {

        if ( USING_JSONP ) {
            this.jsonpFetchTracksForArtistWithId(artistId, page, pageSize);
        }
    }

    /**
     * Checks the status code of a musixmatch api response.
     * @param statusCode The status code of the api response.
     * @returns `true` if the request was successful ( i.e. response = 200 )
     */
    statusCodeCheck(statusCode: number): boolean {
        switch ( statusCode ) {
            case 200: return true;

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

/*
function dataCallback(response) {
    console.log('DATA CALLBACK');
    console.log(response);
}
*/
