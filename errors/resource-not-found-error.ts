//custom error for when resources arent found in the database
export default class ResourceNotFoundError extends Error{

    resourceId:string;

    constructor(message:string, resourceId:string){
        super(message);
        this.resourceId = resourceId;
    }
}