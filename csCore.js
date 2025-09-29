const ColonySim = {};

ColonySim.Core = {};

ColonySim.Core.Constructors = {};

ColonySim.Core.Constructors.Data = function(){
    this.id = "";
};

ColonySim.Core.Constructors.Event = function(){
    this.handlers=[];
    this.addHandler = function(onEventCall){
        this.handlers.push(onEventCall);
    };
    this.trigger = function(element){
        this.handlers.forEach(h => h(element));
    };
};

ColonySim.Core.Constructors.DataManagement = function(label){
    this.label = label;
    this.data = [];
    this.counter = 0;
    this.addEvent = new ColonySim.Core.Constructors.Event();
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
    this.removeEvent = new ColonySim.Core.Constructors.Event();
    this.remove = function(data){
        this.removeEvent.trigger(data)
        this.data = this.data.filter(d => d !== data);
        data = null;
    };
};

ColonySim.Core.Constructors.IdSetsBuffer = function(){
    this.idSets = []; 
    this.addIdSet = function(...ids){
        this.idSets.push([...ids]);
    };
    this.readIdSets = function(){
        const idSs = this.idSets;
        this.idSets = [];
        return idSs;
    };
};

ColonySim.Core.DataManagement = {
    Citizens: new ColonySim.Core.Constructors.DataManagement("citizen"),
    Locations: new ColonySim.Core.Constructors.DataManagement("location"),
    Storages: new ColonySim.Core.Constructors.DataManagement("storage"),
    Tasks: new ColonySim.Core.Constructors.DataManagement("task")
};

ColonySim.Core.ViewBuffers = {};
ColonySim.Core.ViewBuffers.Utility = {};
ColonySim.Core.ViewBuffers.Utility.selectPathByData = function(root, data){
    let path = {};
    if(data instanceof ColonySim.Game.Constructors.Citizen){ path = root.citizens;}
    if(data instanceof ColonySim.Game.Constructors.Location){ path = root.locations;}
    if(data instanceof ColonySim.Game.Constructors.Task){ path = root.tasks;}
    return path;
}
ColonySim.Core.ViewBuffers.AddEvents = {};
ColonySim.Core.ViewBuffers.AddEvents.onData = function(data){
    let path = ColonySim.Core.ViewBuffers.Utility.selectPathByData(ColonySim.Core.ViewBuffers.AddEvents, data);
    path.addIdSet(data.id);
};
ColonySim.Core.ViewBuffers.AddEvents.locations = new ColonySim.Core.Constructors.IdSetsBuffer();
ColonySim.Core.ViewBuffers.AddEvents.citizens = new ColonySim.Core.Constructors.IdSetsBuffer();
ColonySim.Core.ViewBuffers.AddEvents.tasks = new ColonySim.Core.Constructors.IdSetsBuffer();

ColonySim.Core.DataManagement.Citizens.addEvent.addHandler(ColonySim.Core.ViewBuffers.AddEvents.onData);
ColonySim.Core.DataManagement.Locations.addEvent.addHandler(ColonySim.Core.ViewBuffers.AddEvents.onData);
ColonySim.Core.DataManagement.Tasks.addEvent.addHandler(ColonySim.Core.ViewBuffers.AddEvents.onData);

ColonySim.Core.ViewBuffers.RemoveEvents = {};
ColonySim.Core.ViewBuffers.RemoveEvents.onData = function(data){
    const pathR = ColonySim.Core.ViewBuffers.Utility.selectPathByData(ColonySim.Core.ViewBuffers.RemoveEvents, data);
    const pathA = ColonySim.Core.ViewBuffers.Utility.selectPathByData(ColonySim.Core.ViewBuffers.AddEvents, data);
    if (pathA.idSets.filter(i => i[0] === data.id).length > 0){
        pathA.idSets = pathA.idSets.filter(i => i[0] !== data.id);
    } else {
        pathR.addIdSet(data.id);
    }
};
ColonySim.Core.ViewBuffers.RemoveEvents.locations = new ColonySim.Core.Constructors.IdSetsBuffer();
ColonySim.Core.ViewBuffers.RemoveEvents.citizens = new ColonySim.Core.Constructors.IdSetsBuffer();
ColonySim.Core.ViewBuffers.RemoveEvents.tasks = new ColonySim.Core.Constructors.IdSetsBuffer();

ColonySim.Core.DataManagement.Citizens.removeEvent.addHandler(ColonySim.Core.ViewBuffers.RemoveEvents.onData);
ColonySim.Core.DataManagement.Locations.removeEvent.addHandler(ColonySim.Core.ViewBuffers.RemoveEvents.onData);
ColonySim.Core.DataManagement.Tasks.removeEvent.addHandler(ColonySim.Core.ViewBuffers.RemoveEvents.onData);

ColonySim.Core.ViewBuffers.ChangeEvents = {};
ColonySim.Core.ViewBuffers.ChangeEvents.Citizens = {
    currentTasks: new ColonySim.Core.Constructors.IdSetsBuffer(),
    onCurrentTaskChanged(citizen){
        const cct = ColonySim.Core.ViewBuffers.ChangeEvents.Citizens.currentTasks;
        cct.idSets = cct.idSets.filter(set => set[0] !== citizen.id);
        cct.addIdSet(citizen.id, citizen.currentTask.id);
    },
    onCitizenCreated(citizen){
        citizen.currentTaskChangedEvent.addHandler(ColonySim.Core.ViewBuffers.ChangeEvents.Citizens.onCurrentTaskChanged);
    }
};
ColonySim.Core.DataManagement.Citizens.addEvent.addHandler(ColonySim.Core.ViewBuffers.ChangeEvents.Citizens.onCitizenCreated);