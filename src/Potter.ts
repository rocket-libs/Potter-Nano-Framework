import PotterState from "./PotterState";
import Shuttler from "shuttlerjs";
import { PotterContext } from "./PotterContext";
import { Listener } from "shuttlerjs/dist/Shuttler";


export interface IPotter<TRepository,TModel>{
    pushToModel: (value: Partial<TModel>) => void;
    pushToRepository: (value: Partial<TRepository>) => void;
}

export default abstract class Potter<TRepository,TModel,TState extends PotterState<TRepository,TModel>> implements IPotter<TRepository,TModel>{
    private shuttler: Shuttler<PotterContext<TRepository,TModel>>;
    public state: TState;
    public context: PotterContext<TRepository,TModel>;

    constructor(repository: TRepository, model: TModel, state: TState){
        this.context = new PotterContext<TRepository,TModel>(repository,model);
        this.state = state;
        this.state.context = this.context;
        this.state.potter = this;
        this.shuttler = new Shuttler<PotterContext<TRepository,TModel>>(this.state.context);
    }

    /**
     * Returns an array containing all the listeners subscribing to changes
     */
    public get broadcastListeners(): Listener<PotterContext<TRepository,TModel>>[]{
        return this.shuttler.broadcastListeners;
    }

    /**
     * Returns a value indicating whether or not any listener is subscribing to changes
     */
    public get hasBroadcastListeners(): boolean {
        return this.shuttler.hasBroadcastListeners;
    }
   

    /**
     * Updates the model object.
     * @param value Object containing values to be updated. The property names are used to map the values to the correct values in model.
     */
    public pushToModel(value: Partial<TModel>){
        this.pushToObject(this.context.model,value);
    }

    /**
     * Updates the state object.
     * @param value Object containing values to be updated. The property names are used to map the values to the correct values in state.
     */
    public pushToState(value: Partial<TState>){
        this.pushToObject(this.state,value);
    }

    /**
     * Updates the repository object.
     * @param value Object containing values to be updated. The property names are used to map the values to the correct values in repository.
     */
    public pushToRepository(value: Partial<TRepository>){
        this.pushToObject(this.context.repository,value);
    }

    /**
     * This method allows you to add a listener for changes to the context.
     * Be sure to add at least one listener, otherwise you'll have no way of knowing your context has changed.
     * The call to 'subscribe' returns a callback function which can be used to clean up the subscription.
     * @param fn the function to be called to notify the subscriber that the model changed.
     */
    public subscribe(fnListener: () => void) : () => void {
        return this.shuttler.subscribe(fnListener);
    }

    /**
     * You may use this method to fire a notification to all listeners that the context has changed.
     */
    public broadcastContextChanged() {
        this.context.changeId = Math.round(new Date().getTime());
        this.shuttler.broadcastModelChanged();
    }

    

    private pushToObject(destinationObject: any,value: object) {
        const targetPropertyNames = Object.getOwnPropertyNames(value);
        targetPropertyNames.map(propertyName => this.writeToObject(destinationObject,propertyName,value));
        this.broadcastContextChanged();
    }

    private writeToObject(destinationObject: object,propertyName: string,sourceOject: any) {
        const value = sourceOject[propertyName];
        Reflect.set(destinationObject,propertyName,value);
    }
}