export class PotterContext<TRepository,TModel>{
    repository: TRepository;
    model: TModel;
    changeId: number = 0;
        
    constructor(repository: TRepository, model: TModel){
        this.repository = repository;
        this.model = model;
    }
}