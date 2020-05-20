import { PotterContext } from "../dist/PotterContext";


class TestModel{
    name: string = "";
}

class NotModel{
    name: string = "";
}

class TestRepo{
    notModels : NotModel[] | null = null;
    models: TestModel[] | null = null;
    numbers: number[] | null = null;
    stringValue: string = "";
}

class Context extends PotterContext<TestRepo,TestModel>{

}

const insertWorks = () => {
    const name = "Alpha";
    const context = new Context(new TestRepo(),new TestModel());
    const newModel = new TestModel();
    newModel.name = name;
    context.insert(newModel);
    
    expect(context.repository.models.length).toBe(1);
    expect(context.repository.models[0].name).toBe(name)
}

test("Insert works",insertWorks);