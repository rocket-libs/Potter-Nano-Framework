# Potter-NF

Potter is a nano framework for JS/TS applications that helps structure how your code is laid out and written.

## Why?
The initial motivation for writing this framework was to get an easy and straight-forward way to perform state management in a ReactJS application I was working on.

Why not just use Redux? Well at first I did, and after a couple of weeks learning Redux, I found that while Redux forced me structure the application, the cost in terms of boilerplate was unjustifiably high... I was writing more boilerplate than I was business logic. I also at the time happened to be working on a Flutter mobile app, contrasting BLoC (which I was using on Flutter) to Redux, it was painfully obvious that state management doesn't have to be complicated and overly verbose. 

## Potter-NF's Aspirations 
1. A rock-solid, light and easy to learn library. Pick it up, test drive it and see if it'll work for you, all in under a half hour.
2. Minimal boilerplate - focus on your code, not on rituals aka boilerplate, leaving your code lean and clean enough, that you come back, and are able to easily understand the code a couple of weeks/months/years/(decades?) later.


## Getting Started
While Potter-NF does not explicitly require React to function, it requires a renderer library to update the UI. Theoretically VueJS or any other JS renderer should work as well as React, but examples shall be in ReactJS as that's the library am most farmiliar with and thus the one in which I'll best be able to showcase the features.

Also while Potter-NF can work with both JavaScript and TypeScript, for the sake of not being too avoiding redundancy and repetion, I'll whenever I need to reference a language, I'll say TypeScript and all examples will be in TypeScript.

### Potter-NF's Philosophy (or a bit of context)
A key principle of Potter-NF is your application will be generally composed of:

1. User Interface - self explanatory I guess.
2. Business logic - the rules that do the heavy lifting that make your app, "your app".
3. Context (or State) - these are conditions that your Business Logic will take into account when executing (e.g Is user signed into app? Is the app busy doing an async action? Did an error occur on last action? e.t.c)
4. Events (e.g button tapped, text field changed, error occured and so on and so on).

A second principle is that your application should be modular, and each module should maintain a single source of truth which is globally available in that specific module. This source of truth forms our context. Going forward, the word module shall be used to mean the collection of components and other files that perform a very specific function in your application. An examples of a module would be ***user registration*** while  ***sign in*** would be a second one.

Let's look at examples.

For code examples, we'll pick snippets from [Potter-NF's Todo example app](https://github.com/rocket-libs/Potter-Nf-Example)

### Usage
#### 1. **Model**
The foundation of every module is a *model* class. The model class is nothing special, a simple TypeScript class with whatever properties you wish. Below is the model class we'll use in our example.
```TS
export default class TodoModel{
    displayLabel: string;
    status: string = "Pending";
    addedDate: Date = new Date();

    constructor(displayLabel: string = ""){
        this.displayLabel = displayLabel;
    }
}
```

#### 2. **Repository**
The repository forms what would be our working memory, it is meant to hold volumes of data that our module regularly reference. It is analogous to a local (in memory) copy of our database, you'll generally be storing arrays in the repository, from these arrays, you can then pick individual items, update them, and save them back to the repository.
*Example Repository*

```TS
import TodoModel from "./TodoModel";

export default class TodoRepository{
    allTodos: TodoModel[] = [
        new TodoModel("Build Awesome App"),
        new TodoModel("Get Lots Of Users"),
        new TodoModel("Profit 😊")
    ];
}
```
A repository is again just a basic TypeScript class with your own custom properties. In the above example, we've initialized the ```allTodos``` property with a set of *Todos* but you're free to start off with an empty array if you wish.

#### 3. **State**
So far we've just been working with basic TypeScript classes, our **State** class is where we begin integrating Potter-NF into our code.

```TS
import { PotterState } from "potter-nf";
import TodoRepository from "./TodoRepository";
import TodoModel from "./TodoModel";

export default class TodoState extends PotterState<TodoRepository,TodoModel>{
    mounted: boolean = false;
    adding: boolean = false;
    todoItemBeingAdded: TodoModel | null = null;
    todoItemBeingEdited: TodoModel | null = null;
    indexOfTodoItemBeingEdited: number | null = null;
}
```
Again our ```TodoState``` is a TypeScript class, the only difference this time, is that it extends ```PotterState``` and also takes in two type parameters the first being the type of our repository and the second being the type of our model.
Additionally we then are free to add our own custom fields in the class. As we change the values of the fields in this class, we'll be able to control the context our application.

#### 4. **Tying Our Classes Together - The Potter Object**
```TS
import Potter from 'potter-nf';
import TodoRepository from './TodoRepository';
import TodoModel from './TodoModel';
import TodoState from './TodoState';
export default class TodoPotter extends Potter<TodoRepository,TodoModel,TodoState>{
    
}
```
This extends the abstract ```Potter``` class in the Potter-NF library. All functionality required is already implemented in the abstract base class, we do however need to extend it, so we can pass our specific **repository, model** and **state** classes to allow the transpiler to catch type errors and also allows your IDE to give you full code-completion, as this gives it knowlegde of your class definitions.

#### 5. **Binding To The User Interface**
**Note 1**: Again, while examples here are in ReactJS, Potter-NF had no dependancies on React and should work just fine with any other rendering library.

**Note 2** For UI integration, we'll show snippets of the key parts, full code  is available from [Potter-NF's Todo example app](https://github.com/rocket-libs/Potter-Nf-Example)
```TS
/** A global instance of our Potter object. This is the work-horse that'll carry all our data
 *  and allow us to read and write state variables.
 * We've made it global and as it encapsulates all our data, this minimizes parameter passing.
 **/
let potter: TodoPotter;

export default function TodoIndex(){
    const [potterChangeId, setPotterChangeId] = useState(0);
    potter = potter ?? new TodoPotter(new TodoRepository(), new TodoModel(), new TodoState());
    useEffect(() => {
        const initializePotter = () : () => void => {
            const potterCleanup = potter.subscribe(() => setPotterChangeId(potter.context.changeId));
            if(!potter.state.mounted){
                potter.pushToState({mounted: true});
            }
            return function cleanup() {
                potterCleanup();
            }
        }
        return initializePotter();
    },[potterChangeId])
    
    return render();
}
```
Let's break down the important bits of the snippet:

- We're using a React functional component which we've called ```TodoIndex```
- We've defined a global instance of our ```TodoPotter``` class. As specified in the comments above it, the instance of ```TodoPotter``` will shuttle our data and commands back and forth thus cut down on parameter passing. We'll see how it is even able to pass data between parents, children and sibling components with a single line of code.
- Instantiating ```potter```. You only need to instantiate the potter object only once, when the your component is loaded.
- We use the ```useEffect``` hook to allow us to piggy-back into React rendering, this way we're able to trigger dom rerendering by calling a special set of methods provided by our ```potter``` object. The code in the ```useEffect``` hook is unfortunately boilerplate and will need to be written as show for every module (in fact, there is no reason not to copy it into your application as-is). But as far as boilerplate goes... that's it, everything else from here on out is business specific logic.

*The ```render```* function
```TS
const render = () => {
       return <div>
                <div>Potter NF Todo Example</div>
                <div className="flex-grid">
                    <div className="flex-col-2">
                        <SectionTitle>Master Pane</SectionTitle>
                        <MasterPane
                            potter={potter} />
                    </div>
                    <div className="flex-col-8">
                        <SectionTitle>Details Pane</SectionTitle>
                        <DetailsPane
                            potter={potter} />
                    </div>
                </div>
            </div>
}
```

Key thing to not: we're using two child components; ```MasterPane``` and ```DetailsPane``` and they each receive exactly one prop - our instance of *potter*

We'll see how potter is used with the ```MasterPane```, this example covers almost all of the use cases so it should be information. Again the source code for the snippets is available at [Potter-NF's Todo example app](https://github.com/rocket-libs/Potter-Nf-Example) so feel free to look at how the ```DetailsPane``` operates if you wish.

##### Master Pane
```TS
import React from "react";
import TodoPotter from "../Potter/TodoPotter";
import TodoModel from "../Potter/TodoModel";

interface IProps{
    potter: TodoPotter;
}

let potter: TodoPotter;

export default function MasterPane(props: IProps){
    potter = props.potter;
    return  <div>
                // App components
            </div>
}
```

Points of Interest:

- Again we have a global ```potter``` field which we assign the value we get as a prop. This value was previously intialized in ```TodoIndex```. Being, an object, it is passed by reference, meaning that whatever data is available in ```TodoIndex``` is now available here. Additionally any changes made in either the parent or child component get reflected in both.

**Making Said Changes**
Let's look at a function that both reads and writes data via potter

- **Reading Data** - As previously mentioned, based on the purpose of data, Potter-NF structures the segregation of the data into **model, repository** or **state**. To read data we may do it as below
```TS
/// The state object is directly accessible on the potter object.
const mounted = potter.state.mounted;

/// The model object is accessible via an intermediary object call 'context'.
const displayLabel = potter.context.model.displayLabel;

/// As with the model object, the repository object is also accessible via the intermediary object 'context'.
const firstModel = potter.context.repository.allTodos[0];

/// Being strongly typed, your custom fields and/or methods are available with full IDE code-completion.

```
- **Writing Data**
```TS
///Writing is fairly straight-foward. Each data container has its own dedicated data descriptively named writer method. 

potter.pushToState({mounted: true});
potter.pushToModel({displayLabel:"Foo"});
potter.pushToRepository({allTodos: []});

/// Calling any of the above triggers the useEffect hook in ```TodoIndex``` and potter figures out whether to request a rerender from React.

```

