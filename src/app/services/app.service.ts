import { Injectable } from '@angular/core';

@Injectable()
export class AppService {

    private _welcomeModalDisplayed = false;

    get welcomeModalDisplayed(): boolean {
        return this._welcomeModalDisplayed;
    } 
}
