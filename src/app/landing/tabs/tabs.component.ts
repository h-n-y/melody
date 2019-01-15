import { Component, Input, Output, EventEmitter } from '@angular/core';

// Enums
import {
    TabCategory,
} from '../../enums';

/**
 * Tabs component for the Landing page.
 * Allows user to filter the Landing page results by 'All', 'Artists', or 'Tracks'
 */
@Component({
    selector: 'app-tabs',
    templateUrl: './tabs.component.html',
    styleUrls: [ './tabs.component.scss' ]
})
export class TabsComponent  {

    // Expose enum to template:
    TabCategory = TabCategory;

    @Input() activeTab: TabCategory;    // the current active tab

    // Emits whenever a new tab is selected
    @Output() selected = new EventEmitter<TabCategory>();

    /**
     * Emits `selected` event for the given tab category.
     * Called after user clicks a tab.
     * @param category - The category of the clicked tab.
     */
    onTabClick(category: TabCategory) {

        // Don't bother if user clicks the same tab consecutively.
        if ( category !== this.activeTab ) {
            this.selected.emit(category);
        }
    }

}
