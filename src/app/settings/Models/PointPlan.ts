export class PointPlan {
    Id: number;
    Name: string;
    IsDefault: boolean;
    IsActive: boolean;
    AssociatedContentCount:number;
    AssociatedContentSourceCount:number;
    isLoaderActive:boolean = false;
    isMoreInfoLoaderActive:boolean = false;
    isViewPlanLoaderActive:boolean = false;
}