import { Component, Output, EventEmitter } from '@angular/core';

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
