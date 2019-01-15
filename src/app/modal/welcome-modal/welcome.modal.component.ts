import { Component, Input, AfterViewInit } from '@angular/core';

/**
 * Welcome Modal
 *
 * A welcome modal to the user that's displayed the first time the Landing page
 * is presented.
 */
@Component({
    templateUrl: './welcome.modal.component.html',
    styleUrls: [ './welcome.modal.component.scss' ]
})
export class WelcomeModalComponent  {

    // Dismisses this modal when called. Provided by the modal service.
    @Input() dismiss: () => void;

    /**
     * Adds a class to the modal element which causes it to animate into view
     * via CSS animation.
     */
    private showModalAnimated() {
        console.log('ANIMATE MODAL');
        const modal = document.getElementById('welcome-modal');

        modal.classList.add('visible');
    }

    /**
     * Dismisses the modal. Called when user clicks the 'Got it' button.
     */
    onUserGotIt() {
        this.dismiss();
    }

    ngAfterViewInit() {

        setTimeout(() => this.showModalAnimated(), 100);
    }
}
