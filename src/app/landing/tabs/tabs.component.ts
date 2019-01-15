import { Component, Input, Output, EventEmitter } from '@angular/core';

// Enums
import {
    TabCategory,
} from '../../enums';

@Component({
    selector: 'app-tabs',
    templateUrl: './tabs.component.html',
    styleUrls: [ './tabs.component.scss' ]
})
export class TabsComponent  {

    // Expose enum to template:
    TabCategory = TabCategory;

    @Input() activeTab: TabCategory;

    @Output() selected = new EventEmitter<TabCategory>();

    onTabClick(category: TabCategory) {
        this.selected.emit(category);
    }

}
