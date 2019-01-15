import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';

import { WelcomeModalComponent } from './welcome-modal/welcome.modal.component';
import { SearchModalComponent } from './search-modal/search.modal.component';

@NgModule({
    imports: [
        ReactiveFormsModule, 
        CommonModule,
        SharedModule,
    ],
    declarations: [
        WelcomeModalComponent,
        SearchModalComponent,
    ],
    exports: [],
})
export class ModalModule { }
