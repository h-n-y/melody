import { Injectable } from '@angular/core';
import { DOMService } from './dom.service';
import { Subject } from 'rxjs';

// Modal Components
import { WelcomeModalComponent } from '../modal/welcome-modal/welcome.modal.component';
import { SearchModalComponent } from '../modal/search-modal/search.modal.component';

/**
 * A service for presenting and dismissing modals.
 *
 * Help for building modal service was found at
 * https://itnext.io/angular-create-your-own-modal-boxes-20bb663084a1
 */
@Injectable()
export class ModalService {

    private readonly modalElementId = 'modal-container';
    private readonly overlayElementId = 'modal-overlay';
    private readonly noPageScrollClass = 'no-scroll';

    private _welcomeModalDisplayed = false;

    private init(component: any, inputs: object, outputs: object) {
        let componentConfig = { inputs, outputs };
        this.domService.appendComponentTo(this.modalElementId, component, componentConfig);
        document.getElementById(this.modalElementId).className = 'show';
        document.getElementById(this.overlayElementId).className = 'show';
    }

    private announceModalDismissalSource = new Subject<void>();

    announceModalDismissal$ = this.announceModalDismissalSource.asObservable();

    /**
     * disables page scrolling
     */
    private preventPageScrolling() {
        document.body.classList.add(this.noPageScrollClass);
    }

    /**
     * enables page scrolling
     */
    private resumePageScrolling() {
        document.body.classList.remove(this.noPageScrollClass);
    }

    constructor(private domService: DOMService) { }

    /**
     * @returns `true` iff this modal service has displayed the Welcome Modal
     * at least one time.
     */
    get welcomeModalDisplayed(): boolean {
        return this._welcomeModalDisplayed;
    }

    /**
     * Displays the Welcome modal.
     */
    displayWelcomeModal() {
        this.preventPageScrolling();

        const inputs = {
            dismiss: () => this.destroy()
        };
        this.init(WelcomeModalComponent, inputs, {});
        this._welcomeModalDisplayed = true;
    }

    /**
     * Displays the music Search modal.
     */
    displaySearchModal() {
        this.preventPageScrolling();

        const inputs = {
            dismiss: () => this.destroy()
        };
        this.init(SearchModalComponent, inputs, {});
    }

    destroy() {
        this.domService.removeComponent();
        document.getElementById(this.modalElementId).className = 'hidden';
        document.getElementById(this.overlayElementId).className = 'hidden';
        this.resumePageScrolling();

        this.announceModalDismissalSource.next();
    }
}
