import { Component } from '@angular/core';

// Services
import { ModalService } from './services/modal.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'music-search';

    private dismissModal() {
        this.modalService.destroy();
    }

    constructor(private modalService: ModalService) { }

    /**
     * Called after user clicks the search bar in the header.
     * Displays the music search modal.
     */
    onSearchBarClick() {
        console.log('app component - search');
        this.modalService.displaySearchModal();

        this.modalService.displayWelcomeModal();
    }

    onModalOverlayClick() {
        console.log('click?');
        this.dismissModal();
    }

}
