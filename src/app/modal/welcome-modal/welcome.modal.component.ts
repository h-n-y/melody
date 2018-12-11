import { Component, Input, AfterViewInit } from '@angular/core';

@Component({
    templateUrl: './welcome.modal.component.html',
    styleUrls: [ './welcome.modal.component.scss' ]
})
export class WelcomeModalComponent  {

    @Input() dismiss: () => void;

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
