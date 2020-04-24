export class GoogleAnalyticsProfile {
  ProfileId: string;
  ProfileName: string;
  WebsiteUrl: string;
  IsEnabled: boolean;
}

export class GoogleAnalyticsAccount {
  GoogleAnalyticsAccountId: string;
  GoogleAnalyticsAccountName: string;
  ProfileCount: number;
  IsEnabled: boolean;
  GoogleAccountUserImageUrl: string;
  GoogleAccountUserName: string;
  GoogleAnalyticsProfiles: GoogleAnalyticsProfile [];
  IsExpanded: boolean;
}