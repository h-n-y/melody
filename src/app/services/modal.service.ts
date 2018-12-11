import { Injectable } from '@angular/core';
import { DOMService } from './dom.service';

// Modal Components
import { WelcomeModalComponent } from '../modal/welcome-modal/welcome.modal.component';

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

    private _welcomeModalDisplayed = false;

    private init(component: any, inputs: object, outputs: object) {
        let componentConfig = { inputs, outputs };
        this.domService.appendComponentTo(this.modalElementId, component, componentConfig);
        document.getElementById(this.modalElementId).className = 'show';
        document.getElementById(this.overlayElementId).className = 'show';
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
        console.log('displaying welcome modal...');
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
        console.log('displaying search modal...');
    }

    destroy() {
        this.domService.removeComponent();
        document.getElementById(this.modalElementId).className = 'hidden';
        document.getElementById(this.overlayElementId).className = 'hidden';
    }
}
