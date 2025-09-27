const ColonySim = {};

ColonySim.Constructors = {};

ColonySim.Constructors.Data = function(){
    this.id = "";
};

ColonySim.Constructors.Event = function(){
    this.handlers=[];
    this.addHandler = function(onEventCall){
        this.handlers.push(onEventCall);
    };
    this.trigger = function(element){
        this.handlers.forEach(h => h(element));
    };
};

ColonySim.Constructors.DataManagement = function(label){
    this.label = label;
    this.data = [];
    this.counter = 0;
    this.addEvent = new ColonySim.Constructors.Event();
    this.getDataById = function(id){
        return this.data.filter(el => el.id === id)[0];
    };
    this.add = function(data){
        this.counter += 1;
        const count = this.counter;
        data.id = this.label+count;
        this.data.push(data);
        this.addEvent.trigger(data);
    };
    this.removeEvent = new ColonySim.Constructors.Event();
    this.remove = function(data){
        this.removeEvent.trigger(data)
        this.data = this.data.filter(d => d !== data);
        data = null;
    };
};

ColonySim.DataManagement = {
    Citizens: new ColonySim.Constructors.DataManagement("citizen"),
    Locations: new ColonySim.Constructors.DataManagement("location"),
    Storages: new ColonySim.Constructors.DataManagement("storage"),
    Tasks: new ColonySim.Constructors.DataManagement("task")
};

ColonySim.Constructors.IdBuffer = function(){
    this.idSets = []; 
    this.addIdSet = function(...ids){
        this.idSets.push([...ids]);
    };
    this.readIdSets = function(){
        const idSs = this.idSets;
        this.idSets = [];
        return idSs;
    };
}

ColonySim.ViewBuffers = {}
ColonySim.ViewBuffers.Tasks = {
    toCreate: new ColonySim.Constructors.IdBuffer(),
    toRemove: new ColonySim.Constructors.IdBuffer(),
    onAdd(task){
        ColonySim.ViewBuffers.Tasks.toCreate.addIdSet(task.id);
    },
    onRemove(task){
        const vbTasks = ColonySim.ViewBuffers.Tasks;
        if (vbTasks.toCreate.idSets.filter(i => i[0] === task.id).length > 0){
            vbTasks.toCreate.idSets = vbTasks.toCreate.idSets.filter(i => i[0] !== task.id);
        } else {
            vbTasks.toRemove.addIdSet(task.id);
        }
    }
};
ColonySim.DataManagement.Tasks.addEvent.addHandler(ColonySim.ViewBuffers.Tasks.onAdd);
ColonySim.DataManagement.Tasks.removeEvent.addHandler(ColonySim.ViewBuffers.Tasks.onRemove);

ColonySim.ViewBuffers.Citizens = {
    toChangeCurrentTask: new ColonySim.Constructors.IdBuffer,
    onCurrentTaskChanged(citizen){
        const cct = ColonySim.ViewBuffers.Citizens.toChangeCurrentTask;
        cct.idSets = cct.idSets.filter(set => set[0] !== citizen.id);
        cct.addIdSet(citizen.id, citizen.currentTask.id);
    },
    onCitizenCreated(citizen){
        citizen.currentTaskChangedEvent.addHandler(ColonySim.ViewBuffers.Citizens.onCurrentTaskChanged);
    }
};
ColonySim.DataManagement.Citizens.addEvent.addHandler(ColonySim.ViewBuffers.Citizens.onCitizenCreated);