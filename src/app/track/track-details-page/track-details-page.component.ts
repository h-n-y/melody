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

@Component({
    templateUrl: './track-details-page.component.html',
    styleUrls: [ './track-details-page.component.scss' ]
})
export class TrackDetailsPageComponent implements OnInit, OnDestroy  {

    private paramsSub: any;

    private trackId: number;

    track: Track;
    lyrics: Lyrics;
    lyricsLines: string[] = [];  // The song lyrics broken into lines.


    private fetchTrack(trackId: number) {
        this.musicService.fetchTrackWithId(trackId);
    }

    private fetchLyricsForTrackWithId(trackId: number) {
        this.musicService.fetchLyricsForTrackWithId(trackId);
    }

    private listenForTrack() {
        this.musicService.trackForId$.subscribe((track: Track) => {
            this.track = track;     
        });
    }

    private listenForTrackLyrics() {
        this.musicService.trackLyricsForId$.subscribe((lyrics: Lyrics) => {
            console.log('lyrics!!!!!');
            console.log(lyrics);
            this.lyrics = lyrics;
            this.lyricsLines = this.lyrics.lyrics_body.split('\n');
        });
    }

    private listenForModalDismissal() {
        // Scroll to top of page if modal was just dismissed.
        this.modalService.announceModalDismissal$.subscribe(() => {
            document.body.scrollTop = 0;
        });
    }

    constructor(private route: ActivatedRoute,
               private musicService: MusicService,
               private modalService: ModalService) { }

    ngOnInit() {
        this.listenForTrack();
        this.listenForTrackLyrics();

        this.listenForModalDismissal();


        //this.track = JSON.parse(window.localStorage.getItem('track'));
        //console.log(this.track);
        //this.musicService.fetchLyricsForTrackWithId(this.track.track_id);

        this.paramsSub = this.route.params.subscribe((params) => {
            console.log('--------------------------------------');
            this.trackId = +params['trackId'];
            this.fetchTrack(this.trackId);
            this.fetchLyricsForTrackWithId(this.trackId);
        });
    }

    ngOnDestroy() {
        this.paramsSub.unsubscribe();
    }
}
