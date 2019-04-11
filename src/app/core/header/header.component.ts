import { Component, Output, EventEmitter } from '@angular/core';

/**
 * Fixed header. Presents a faux search bar that displays a search modal on click.
 */
@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: [ './header.component.scss' ]
})
export class HeaderComponent  {

    // Emits an event whenever user clicks on the search bar.
    @Output() search = new EventEmitter<void>();

    /**
     * Called when user clicks the search bar. Emits an event
     * notifying the parent AppComponent that the user wants to
     * search.
     */
    onSearchBarClick() {
        this.search.emit();
    }
}
