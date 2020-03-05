import Potter from "../dist/Potter"
import PotterState from "../dist/PotterState";

class TestRepo{
    alpha: string = "";
    beta: number = 4;
}

class TestState extends PotterState<TestRepo,TestModel>{
    blah: string;
}

class TestModel{
    finalAlpha: string = "";
}

class TestPotter extends Potter<TestRepo,TestModel,TestState>{

}

const testIt = () => {
    const potter = new TestPotter(new TestRepo(),new TestModel());
    potter.pushToRepository({alpha: ""})
    potter.pushToModel({finalAlpha = 3})

}