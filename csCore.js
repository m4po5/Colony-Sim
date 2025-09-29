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

ColonySim.Core.ViewBuffers = {}
ColonySim.Core.ViewBuffers.Tasks = {
    toCreate: new ColonySim.Core.Constructors.IdSetsBuffer(),
    toRemove: new ColonySim.Core.Constructors.IdSetsBuffer(),
    onAdd(task){
        ColonySim.Core.ViewBuffers.Tasks.toCreate.addIdSet(task.id);
    },
    onRemove(task){
        const vbTasks = ColonySim.Core.ViewBuffers.Tasks;
        if (vbTasks.toCreate.idSets.filter(i => i[0] === task.id).length > 0){
            vbTasks.toCreate.idSets = vbTasks.toCreate.idSets.filter(i => i[0] !== task.id);
        } else {
            vbTasks.toRemove.addIdSet(task.id);
        }
    }
};
ColonySim.Core.DataManagement.Tasks.addEvent.addHandler(ColonySim.Core.ViewBuffers.Tasks.onAdd);
ColonySim.Core.DataManagement.Tasks.removeEvent.addHandler(ColonySim.Core.ViewBuffers.Tasks.onRemove);

ColonySim.Core.ViewBuffers.Citizens = {
    toCreate: new ColonySim.Core.Constructors.IdSetsBuffer(),
    toRemove: new ColonySim.Core.Constructors.IdSetsBuffer(),
    onAdd(citizen){
        ColonySim.Core.ViewBuffers.Citizens.toCreate.addIdSet(citizen.id);
    },
    onRemove(citizen){
        const vbTasks = ColonySim.Core.ViewBuffers.Citizens;
        if (vbTasks.toCreate.idSets.filter(i => i[0] === citizen.id).length > 0){
            vbTasks.toCreate.idSets = vbTasks.toCreate.idSets.filter(i => i[0] !== citizen.id);
        } else {
            vbTasks.toRemove.addIdSet(citizen.id);
        }
    }
};
ColonySim.Core.DataManagement.Citizens.addEvent.addHandler(ColonySim.Core.ViewBuffers.Citizens.onAdd);
ColonySim.Core.DataManagement.Citizens.removeEvent.addHandler(ColonySim.Core.ViewBuffers.Citizens.onRemove);

ColonySim.Core.ViewBuffers.Citizens.Changes = {
    toChangeCurrentTask: new ColonySim.Core.Constructors.IdSetsBuffer(),
    onCurrentTaskChanged(citizen){
        const cct = ColonySim.Core.ViewBuffers.Citizens.Changes.toChangeCurrentTask;
        cct.idSets = cct.idSets.filter(set => set[0] !== citizen.id);
        cct.addIdSet(citizen.id, citizen.currentTask.id);
    },
    onCitizenCreated(citizen){
        citizen.currentTaskChangedEvent.addHandler(ColonySim.Core.ViewBuffers.Citizens.Changes.onCurrentTaskChanged);
    }
};
ColonySim.Core.DataManagement.Citizens.addEvent.addHandler(ColonySim.Core.ViewBuffers.Citizens.Changes.onCitizenCreated);

ColonySim.Core.ViewBuffers.Locations = {
    toCreate: new ColonySim.Core.Constructors.IdSetsBuffer(),
    toRemove: new ColonySim.Core.Constructors.IdSetsBuffer(),
    onAdd(location){
        ColonySim.Core.ViewBuffers.Locations.toCreate.addIdSet(location.id);
    },
    onRemove(location){
        const vbTasks = ColonySim.Core.ViewBuffers.Locations;
        if (vbTasks.toCreate.idSets.filter(i => i[0] === location.id).length > 0){
            vbTasks.toCreate.idSets = vbTasks.toCreate.idSets.filter(i => i[0] !== location.id);
        } else {
            vbTasks.toRemove.addIdSet(location.id);
        }
    }
}
ColonySim.Core.DataManagement.Locations.addEvent.addHandler(ColonySim.Core.ViewBuffers.Locations.onAdd);
ColonySim.Core.DataManagement.Locations.removeEvent.addHandler(ColonySim.Core.ViewBuffers.Locations.onRemove);