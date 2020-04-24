export class Team {
    TeamId: number;
    Title: string;
    Description: string;
    Selected: boolean;
    IsDefault = false;
    IsTeamLeaderBoard = false;
    UserCount: number;
    IsLeaderBoardViewEnabled = true;
    IsUserListForTeamLoading =  false;
}