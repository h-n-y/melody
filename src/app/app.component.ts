import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

// Services
import { ModalService } from './services/modal.service';

const APPLICATION_TITLE = 'Melody';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    title = 'music-search';

    private dismissModal() {
        this.modalService.destroy();
    }

    /**
     * Sets the text node in the <title></title> tag
     * @param {string} title - The name to assign the title tag.
     */
    private setAppTitle(title: string) {
        this.titleService.setTitle(title);
    }

    constructor(private modalService: ModalService,
                private titleService: Title) { }

    /**
     * Called after user clicks the search bar in the header.
     * Displays the music search modal.
     */
    onSearchBarClick() {
        this.modalService.displaySearchModal();

        //this.modalService.displayWelcomeModal();

    }

    onModalOverlayClick() {
        this.dismissModal();
    }


    //
    // LIFECYCLE HOOKS
    //

    ngOnInit() {
        this.setAppTitle(APPLICATION_TITLE);
    }
}
