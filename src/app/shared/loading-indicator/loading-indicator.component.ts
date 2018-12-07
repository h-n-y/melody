import { Component, Input } from '@angular/core';

/**
 * An animated loading indicator that's displayed whenever the application
 * is waiting for a response from an http request.
 */
@Component({
    selector: 'app-loading-indicator',
    templateUrl: './loading-indicator.component.html',
    styleUrls: [ './loading-indicator.component.scss' ]
})
export class LoadingIndicatorComponent {

    // A label meant for describing what is being waited on. ( i.e. 'Searching Artists' )
    @Input() label: string;
}
