import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// Interfaces
import {
    Track,
    Lyrics,
} from '../../interfaces';

// Services
import { MusicService } from '../../services/music.service';
import { ModalService } from '../../services/modal.service';

/**
 * Track Details Page
 *
 * Displays name, album, and lyrics for a particular track.
 *
 */
@Component({
    templateUrl: './track-details-page.component.html',
    styleUrls: [ './track-details-page.component.scss' ]
})
export class TrackDetailsPageComponent implements OnInit, OnDestroy  {

    private paramsSub: any; // subscription ref for route params

    private trackId: number;    // the id of the track

    track: Track;   // the track itself
    lyrics: Lyrics; // the track's lyrics
    lyricsLines: string[] = [];  // The song lyrics broken into lines.


    /**
     * Requests the music service fetch the track for the given id.
     * @param trackId - The track id.
     */
    private fetchTrack(trackId: number) {
        this.musicService.fetchTrackWithId(trackId);
    }

    /**
     * Requests the music service fetch the lyrics for the given track.
     * @param trackId - The id of the track.
     */
    private fetchLyricsForTrackWithId(trackId: number) {
        this.musicService.fetchLyricsForTrackWithId(trackId);
    }

    /**
     * Subscribes to updates to the track search results.
     */
    private listenForTrack() {
        this.musicService.trackForId$.subscribe((track: Track) => {
            this.track = track;     
        });
    }

    /**
     * Subscribes to updates to the track lyrics results.
     */
    private listenForTrackLyrics() {
        this.musicService.trackLyricsForId$.subscribe((lyrics: Lyrics) => {
            this.lyrics = lyrics;
            this.lyricsLines = this.lyrics.lyrics_body.split('\n');
        });
    }

    /**
     * Listens for any modal dismissal announcements and scrolls page to the
     * top. Makes for better UX if user is switching track lyrics.
     */
    private listenForModalDismissal() {
        // Scroll to top of page if modal was just dismissed.
        this.modalService.announceModalDismissal$.subscribe(() => {
            document.body.scrollTop = 0;
        });
    }

    constructor(private route: ActivatedRoute,
               private musicService: MusicService,
               private modalService: ModalService) { }

   //
   // Lifecycle Hooks
   //

    ngOnInit() {
        this.listenForTrack();
        this.listenForTrackLyrics();

        this.listenForModalDismissal();


        this.paramsSub = this.route.params.subscribe((params) => {
            this.trackId = +params['trackId'];
            this.fetchTrack(this.trackId);
            this.fetchLyricsForTrackWithId(this.trackId);
        });
    }

    ngOnDestroy() {
        this.paramsSub.unsubscribe();
    }
}
