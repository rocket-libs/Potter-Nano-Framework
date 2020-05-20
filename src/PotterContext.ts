export class PotterContext<TRepository,TModel>{
    repository: TRepository;
    model: TModel;
    changeId: number = 0;
        
    constructor(repository: TRepository, model: TModel){
        this.repository = repository;
        this.model = model;
    }

    insert<TObject>(object: TObject) {
        const repositoryObj = this.repository as unknown as object;
        const candidateKeys = Reflect.ownKeys(repositoryObj);
        for (const key of candidateKeys) {
            const candidateProperty = Reflect.get(repositoryObj,key) as TObject[];
            if(candidateProperty && Array.isArray(candidateProperty)){
                candidateProperty.push(object);
                return;
            }
        }
    }
}