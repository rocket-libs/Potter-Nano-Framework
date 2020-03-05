import { PotterContext } from "./PotterContext";
import { IPotter } from "./Potter";

export default abstract class PotterState<TRepository,TModel>{
    context: PotterContext<TRepository,TModel> = {} as PotterContext<TRepository,TModel>;
    potter: IPotter<TRepository,TModel> = {} as IPotter<TRepository,TModel>;
    
}