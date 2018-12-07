import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingRoutingModule } from './landing-routing.module';
import { SharedModule } from '../shared/shared.module';

import { LandingPageComponent } from './landing-page/landing-page.component';
import { TabsComponent } from './tabs/tabs.component';

@NgModule({
    imports: [
        CommonModule,
        LandingRoutingModule, 
        SharedModule,
    ],
    declarations: [
        LandingPageComponent,
        TabsComponent,
    ],
    exports: [],
})
export class LandingModule { }
