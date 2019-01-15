import { Injectable } from '@angular/core';

/**
 * App Service
 *
 * Service for application-level concerns.
 */
@Injectable()
export class AppService {

    private _welcomeModalDisplayed = false;

    /**
     * @returns `true` iff the welcome modal has been displayed yet.
     */
    get welcomeModalDisplayed(): boolean {
        return this._welcomeModalDisplayed;
    } 
}
