import { Component } from '@angular/core';


/**
 * App footer. Displays links to my portfolio, GitHub, and Musixmatch ( as required by the API terms and conditions ).
 */
@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: [ './footer.component.scss' ]
})
export class FooterComponent  {


    readonly MUSIX_MATCH_HREF = 'https://www.musixmatch.com';
}
