import { Component } from '@angular/core';
import { SHOW_PONY_TOWN_CHAR } from '../../../common/constants';

@Component({
	selector: 'visit-pt-button',
	templateUrl: 'visit-pt-button.pug',
	styleUrls: ['visit-pt-button.scss'],
})
export class VisitPTButton {
	readonly ptLink = 'http://pony.town';
	readonly enableVisitPTButton = true;
	readonly showPonyTownChar = SHOW_PONY_TOWN_CHAR;
	constructor() {
	}
}
