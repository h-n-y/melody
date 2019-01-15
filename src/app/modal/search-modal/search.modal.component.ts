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

@Component({
    templateUrl: './search.modal.component.html',
    styleUrls: [ './search.modal.component.scss' ]
})
export class SearchModalComponent implements OnInit, AfterViewInit {

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

    @Input() dismiss: () => void;

    searchBarShadowVisible = false;

    // Flags indicating which categories are awaiting responses from http requests
    // for the most recent search query.
    searching = {
        artists: false,
        tracks: false,
        lyrics: false
    };

    query = '';
    artists: Artist[] = [];
    tracks: Track[] = [];   // tracks whose title matches the search query
    lyrics: Track[] = [];   // tracks whose lyrics match the search query

    get searchInProgress(): boolean {
        return this.searching.artists &&
                this.searching.tracks &&
                this.searching.lyrics;
    }

    get searchIndicatorLabel(): string {

        return '';

    }

    get resultsExist(): boolean {
        return this.artists.length || this.tracks.length || this.lyrics.length;
    }

    private listenForArtistSearchResults(query: string): Observable<any> {
        if ( query ) {
            return this.musicService.searchArtists(query);
        }

        return [];
    }

    private listenForTrackSearchResults(query: string): Observable<any> {
        if ( query ) {
            return this.musicService.searchTracks(query);
        }

        return [];
    }

    private listenForLyricsSearchResults(query: string): Observable<any> {
        if ( query ) {
            return this.musicService.searchLyrics(query);
        }

        return [];
    }

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

    private focusSearchBar() {
        this.searchBar.nativeElement.focus();
    }

    // development only
    private loadDataFromLocalStorage() {
        this.artists = JSON.parse(window.localStorage.getItem('searchArtists'));
        this.tracks = JSON.parse(window.localStorage.getItem('searchTracks'));
        this.lyrics = JSON.parse(window.localStorage.getItem('searchLyrics'));
    }

    private navigateToSearchResultsPage(query: string, searchCategory: SearchCategory) {
        this.router.navigate(['/search'], {
            queryParams: {
                queryString: query,
                category: searchCategory 
            }});
    }

    private navigateToTrackDetailsPage(track: Track) {
        const url = '/track/' + track.track_id;
        this.router.navigate([url]);
    }

    constructor(private musicService: MusicService,
               private router: Router) { }

    searchForm = new FormGroup({
        searchQuery: new FormControl(''),
    });

    onSubmitQuery() {
    }

    onSeeMoreArtistsBtnClick() {
        console.log('see more artists');
        const query = this.query;
        this.navigateToSearchResultsPage(query, SearchCategory.Artists);

        this.dismiss();
    }

    onSeeMoreTracksBtnClick() {
        console.log('see more tracks');
        const query = this.query;
        this.navigateToSearchResultsPage(query, SearchCategory.Tracks);

        this.dismiss();
    }

    onSeeMoreLyricsBtnClick() {
        console.log('see more lyrics');
        const query = this.query;
        this.navigateToSearchResultsPage(query, SearchCategory.Lyrics);

        this.dismiss();
    }

    onSeeAllResultsBtnClick() {
        console.log('see all results');
        const query = this.query;
        this.navigateToSearchResultsPage(query, SearchCategory.All);

        this.dismiss();
    }

    onArtistSelected(artist: Artist) {
        console.log(artist);
        const url = '/artist/' + artist.artist_id;
        this.router.navigate([url]);

        this.dismiss();
    }

    onTrackSelected(track: Track) {
        console.log(track);
        this.navigateToTrackDetailsPage(track);

        this.dismiss();
    }

    onLyricsSelected(lyricsTrack: Track) {
        console.log(lyricsTrack);
        this.navigateToTrackDetailsPage(lyricsTrack);

        this.dismiss();
    }

    ngOnInit() {
        //this.loadDataFromLocalStorage();
        this.listenForSearchQueryResults();
    }

    ngAfterViewInit() {
        this.focusSearchBar();

        this.searchResultsElement.nativeElement.addEventListener('scroll', this.handleScroll);
    }
}

