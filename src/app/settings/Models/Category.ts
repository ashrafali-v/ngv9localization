export class Category
{
    CategoryId:any;
    Name:string;
    Enabled:boolean;
    Optional:boolean;
}

export class ContentSource
{
    CategoryId:any;
    FeedId:any;
}
export class ContentSourceViewModel
{
category:Category;
feed:ContentSource[];   
}