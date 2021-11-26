import { PotterContext } from './PotterContext';
import { IPotter } from './Potter';

export default abstract class PotterState<TRepository, TModel> {
  protected context: PotterContext<TRepository, TModel> = {} as PotterContext<TRepository, TModel>;
  protected potter: IPotter<TRepository, TModel> = {} as IPotter<TRepository, TModel>;

  public initialize(context: PotterContext<TRepository, TModel>, potter: IPotter<TRepository, TModel>) {
    this.context = context;
    this.potter = potter;
  }
}
