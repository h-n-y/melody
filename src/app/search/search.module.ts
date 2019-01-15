import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchRoutingModule } from './search-routing.module';
import { SharedModule } from '../shared/shared.module';

import { SearchResultsPageComponent } from './search-results-page/search-results-page.component';
import { SearchResultsTabsComponent } from './search-results-page/search-results-tabs/search-results-tabs.component';

@NgModule({
    imports: [
        CommonModule,
        SearchRoutingModule,
        SharedModule,
    ],
    declarations: [
        SearchResultsPageComponent,
        SearchResultsTabsComponent,
    ],
    exports: [],
})
export class SearchModule { }
