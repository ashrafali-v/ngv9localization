import { Observable } from 'rxjs';
import { Select2OptionData } from 'ng-select2';

export class TeamContentSource {
    Title: string;
    FeedId: number;
    TeamCount: number;
    TeamId = 0;
    Teams: Observable<Array<Select2OptionData>>;
}