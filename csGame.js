ColonySim.Game = {};

ColonySim.Game.Constants = {};
ColonySim.Game.Constants.ProfessionsArray = Object.freeze(["hauling", "construction", "animal handling"]);
ColonySim.Game.Constants.Professions = Object.freeze({
    HAULING: ColonySim.Game.Constants.ProfessionsArray[0],
    CONSTRUCTION: ColonySim.Game.Constants.ProfessionsArray[1],
    ANIMAL_HANDLING: ColonySim.Game.Constants.ProfessionsArray[2]
});

ColonySim.Game.Constructors = {};
ColonySim.Game.Constructors.Task = function(name, ticksToComplete, profession, workCall, location, minLevelRequired, expYield){
    ColonySim.Core.Constructors.Data.call(this);
    this.name = name;
    this.ticksToComplete = ticksToComplete;
    this.ticksDone = 0;
    this.profession = profession;
    this.workCall = workCall;
    this.location = location;
    this.minLevelRequired = minLevelRequired;
    this.expYield = expYield;
    this.statusMessages = Object.freeze({
        TODO: "to do",
        INPROGRESS: "in progress",
        DONE: "done",
        ONHOLD: "on hold",
        ABORTED: "aborted"
    });
    this.status = this.statusMessages.TODO;
    this.done = function(){return this.status === this.statusMessages.DONE;};
    this.perpetual = false;
    this.assignee = undefined;
    this.location = location;
    this.work = function(){
        this.progress();
        if(this.done() && typeof this.workCall === "function"){
            this.workCall();
            if (this.perpetual === true){
                this.reset();
            }
        }
    };
    this.progress = function(){
        if(this.done()){
            return;
        }
        this.ticksDone += 1;
        this.status = this.statusMessages.INPROGRESS;
        if (this.ticksDone === this.ticksToComplete){
            this.status = this.statusMessages.DONE;
        }
    };
    this.reset = function(){
        this.ticksDone = 0;
        this.status = this.statusMessages.TODO;
    };
    ColonySim.Core.DataManagement.Tasks.add(this);
};

ColonySim.Game.Constructors.Storage = function(){
    ColonySim.Core.Constructors.Data.call(this);
    this.wares = Object.freeze({wood:"wood",food:"food"});
    this.accepts = {wood:false,food:false};
    this.maxStorage = {wood:50,food:50}
    this.stored = {wood:0,food:0};
    this.addWares = function(ware,amount){
        switch (ware) {
            case this.wares.wood:
                if(this.accepts.wood){
                    this.stored.wood += amount;
                }
                break;
            case this.wares.food:
                if(this.accepts.food){
                    this.stored.food += amount;
                }
                break;
        
            default:
                break;
        }
    };
    this.removeWares = function(ware,amount){
        switch (ware) {
            case this.wares.wood:
                if(amount < this.stored.wood){
                    this.stored.wood -= amount;
                } else {
                    this.stored.wood = 0;
                }
                break;
            case this.wares.food:
                if(amount < this.stored.food){
                    this.stored.food -= amount;
                } else {
                    this.stored.food = 0;
                }
                break;
        
            default:
                break;
        }
    };
    ColonySim.Core.DataManagement.Storages.add(this);
};

ColonySim.Game.Constructors.Location = function(name,storage){
    ColonySim.Core.Constructors.Data.call(this);
    this.name = name;
    this.storage = storage;
    this.taskManagement = new ColonySim.Game.Constructors.Location.TaskManagement(this);
    ColonySim.Core.DataManagement.Locations.add(this);
};

ColonySim.Game.Constructors.Location.TaskManagement = function (location){
    this.location = location;
    this.tasksOverview = () => { return [{}]};
    this.tasks = function(){
        return ColonySim.Core.DataManagement.Tasks.data.filter(t => t.location === this.location);
    }
    this.minLevelRequired = function(){
        let minLevel = 10;
        this.tasks().forEach(task => {
            if(task.minLevelRequired < minLevel){
                minLevel = task.minLevelRequired;
            }
        })
        return minLevel;
    };
    this.tasksDone = function(profession){
        const tasksDone = this.tasks().filter(t => t.profession === profession
            && t.done())
        return tasksDone;
    };
    this.getTaskToPlan = function(profession){
        let taskToPlan = undefined;
        const tasksOverview = this.tasksOverview().filter(task => task.profession===profession);
        const runningTasks = this.tasks().filter(t => t.profession === profession);
        tasksOverview.forEach(task => {
            if(task.isNeeded(this.location)){
                const runningTask = runningTasks.filter(rTask => rTask.name===task.name);
                if (runningTask.length<task.max && taskToPlan === undefined){
                    taskToPlan=task;
                };
            };
        })
        return taskToPlan;
    };
    this.getSurplusTasks = function(profession){
        const surplusTasks = [];
        const tasksOverview = this.tasksOverview().filter(task => task.profession===profession);
        const runningTasks = this.tasks().filter(t => t.profession === profession);
        tasksOverview.forEach(t => {
            if (!t.isNeeded(this.location)){
                surplusTasks.push(...runningTasks.filter(r => r.name === t.name));
            };
        });
        return surplusTasks;
    };
    this.getAvailableTasks = function(profession){
        return this.tasks().filter(task => task.assignee === undefined
                                && task.profession === profession
                                && !task.done());
    };
    this.createOverseeTask = function(profession){
        let task = new ColonySim.Game.Constructors.Task("overseeing "+profession,
            10,
            profession,
            this.overseeingWorkCall,
            this.location,
            0)
        task.perpetual = true;
        return task;
    };
    this.overseeingWorkCall = function(){
        const dmTasks = ColonySim.Core.DataManagement.Tasks;
        let tasksDone = this.location.taskManagement.tasksDone(this.profession).filter(t => t!==this);
        let tasksToCancel = this.location.taskManagement.getSurplusTasks(this.profession);
        let taskToPlan = undefined;
        let ass = this.assignee;
        let workTask = undefined;
        if (tasksToCancel.length > 0){
            dmTasks.remove(tasksToCancel[0]);
        } else if ((taskToPlan = this.location.taskManagement.getTaskToPlan(this.profession))!==undefined){
            taskToPlan.call(this.location)
        } else if(tasksDone.length > 0){
            dmTasks.remove(tasksDone[0]);
        } else if((workTask=this.location.taskManagement.tasks().filter(t => t.profession === ass.profession && t.assignee === undefined)[0]) !== undefined){
            ass.assignTask(workTask,true);
        } else {
            ass.planIdleTask(true);
        }
    };
};

ColonySim.Game.Constructors.Citizen = function(name, profession, settlement){
    ColonySim.Core.Constructors.Data.call(this);
    this.name = "J. Doe";
    if (name !== undefined){
        this.name = name;
    };
    this.profession = profession;
    this.settlement = settlement;
    this.tasks = [];
    this.currentTask = undefined;
    this.currentTaskChangedEvent = new ColonySim.Core.Constructors.Event();
    this.assignTask = function(task,unshift){
        if(unshift){
            this.tasks.unshift(task);
        } else {
            this.tasks.push(task);
        }
        task.assignee = this;
    };
    this.unAssignTask = function(task){
        this.tasks = this.tasks.filter(t => t !== task)
    };
    this.tick = function(){
        if (this.tasks.length != 0){
            if (this.currentTask !== this.tasks[0]){
                this.currentTask = this.tasks[0];
                this.currentTaskChangedEvent.trigger(this);
            };
            this.currentTask.work();
            if(this.currentTask.done()){
                this.tasks = this.tasks.filter(t => t != this.currentTask);
                this.currentTask = undefined;
            };
        } else {
            let availableLocations = this.settlement.getLocationsByProfession(this.profession);

            if (availableLocations.length !== 0){
                let sortedLocations = this.settlement.sortLocationByMinLevelRequired(availableLocations);
                
                sortedLocations.forEach(loc => {
                    this.planSeekWorkTask(loc);
                })

                this.tick();
            };
        };
    };
    this.createSeekWorkTask = function(location){
        return new ColonySim.Game.Constructors.Task("seeking work",30,this.profession,this.seekWorkCall,location,0);
    };
    this.seekWorkCall = function(){
        let citizen = this.assignee;
        let availableTasks = undefined;

        availableTasks = this.location.taskManagement.getAvailableTasks(this.profession);
        if (availableTasks.length > 0){
            citizen.assignTask(availableTasks[0]);
        };
        ColonySim.Core.DataManagement.Tasks.remove(this);
    };
    this.createIdleTask = function(){
        let idleTypes = ["stargazing","strolling","picking flowers","watching people work","whistling a tune"];
        let idleType = idleTypes[Math.floor(Math.random() * idleTypes.length)];
        let idleTask = new ColonySim.Game.Constructors.Task(idleType,60);
        idleTask.workCall = ()=>{ColonySim.Core.DataManagement.Tasks.remove(idleTask);};
        return idleTask;
    };
    this.planSeekWorkTask = function(location,unshift){
        this.assignTask(this.createSeekWorkTask(location,unshift));
    };
    this.planIdleTask = function(unshift){
        let IdleTask = this.createIdleTask();
        this.assignTask(IdleTask,unshift);
    };
    ColonySim.Core.DataManagement.Citizens.add(this);
};

ColonySim.Game.Constructors.Settlement = function(name, storage){
    ColonySim.Game.Constructors.Location.call(this,name, storage);
    this.taskManagement = new ColonySim.Game.Constructors.Settlement.TaskManagement(this);
    this.locations = [];
    this.addBuilding = function (building){
        if (building instanceof ColonySim.Game.Constructors.Location){
            this.locations.push(building)
        } else {
            console.error("Settlement.addBuilding: object is not of instance Location")
        }
    };
    this.getLocationsByProfession = function(profession){
        const locations = [];
        if (this.locationOfProfession(pieces.settlement,profession)){
            locations.push(pieces.settlement);
        }
        pieces.settlement.locations.forEach(building => {
            if (this.locationOfProfession(building,profession)){
                locations.push(building);
            }
        });
        
        return locations;
    };
    this.locationOfProfession = function(location,profession){
        let result = false;
        location.taskManagement.tasks().forEach(task => {
            if(task.profession === profession){
                result = true;
            }
        });
        return result;
    };
    this.sortLocationByMinLevelRequired = function(locations){
        return locations.sort((a,b) => b.taskManagement.minLevelRequired() - a.taskManagement.minLevelRequired());
    };
}
ColonySim.Game.Constructors.Settlement.prototype = Object.create(ColonySim.Game.Constructors.Location.prototype);//Inherits methods
ColonySim.Game.Constructors.Settlement.prototype.constructor = ColonySim.Game.Constructors.Settlement;

ColonySim.Game.Constructors.Settlement.TaskManagement = function(location){
    ColonySim.Game.Constructors.Location.TaskManagement.call(this,location);
    this.tasksOverview = function(){
    const gatheringWoodTask = {
        name:"gathering wood",
        profession:ColonySim.Game.Constants.Professions.HAULING,
        max:4,
        isNeeded:this.isTaskGatheringWoodNeeded,
        call:this.createTaskGatheringWood
    };
    const gatheringFoodTask = {
        name:"gathering food",
        profession:ColonySim.Game.Constants.Professions.HAULING,
        max:1,
        isNeeded:this.isTaskGatheringFoodNeeded,
        call:this.createTaskGatheringFood
    }
    const huntingTask = {
        name:"hunting",
        profession:ColonySim.Game.Constants.Professions.ANIMAL_HANDLING,
        max:3,
        isNeeded:this.isTaskHuntingNeeded,
        call:this.createTaskHunting
    }
    return [gatheringWoodTask,gatheringFoodTask,huntingTask];
    };
    // Called within taskOverview object.
    this.isTaskGatheringWoodNeeded = function(location){
        if (location.storage.stored.wood <= location.storage.maxStorage.wood){
            return true;
        } else {
            return false;
        }
    };
    // Called within taskOverview object.
    this.createTaskGatheringWood = function(location){
        const gatheringWoodTask = new ColonySim.Game.Constructors.Task(this.name,
            90,
            ColonySim.Game.Constants.Professions.HAULING,
            location.taskManagement.gatheringWoodWorkCall,
            location,
            0,
            [[ColonySim.Game.Constants.Professions.HAULING, 10]]);
        return gatheringWoodTask;
    };
    // Called within Task object
    this.gatheringWoodWorkCall = function(){
        const woodGathered = 1 + Math.floor(Math.random() * 3);
        const storage = this.location.storage;
        storage.addWares(storage.wares.wood,woodGathered);
    };
    this.isTaskGatheringFoodNeeded = function(location){
        if (location.storage.stored.food <= location.storage.maxStorage.food){
            return true;
        } else {
            return false;
        }
    };
    this.createTaskGatheringFood = function(location){
        const gatheringFoodTask = new ColonySim.Game.Constructors.Task(this.name,
            60,
            ColonySim.Game.Constants.Professions.HAULING,
            location.taskManagement.gatheringFoodWorkCall,
            location,
            0,
            [[ColonySim.Game.Constants.Professions.HAULING, 10]]);
        return gatheringFoodTask;
    };
    this.gatheringFoodWorkCall = function(){
        const foodGathered = 2 + Math.floor(Math.random() * 2);
        const storage = this.location.storage;
        storage.addWares(storage.wares.food,foodGathered);
    };
    this.isTaskHuntingNeeded = function(location){
        if (location.storage.stored.food <= location.storage.maxStorage.food){
            return true;
        } else {
            return false;
        }
    };
    this.createTaskHunting = function(location){
        const huntingTask = new ColonySim.Game.Constructors.Task(this.name,
            300,
            ColonySim.Game.Constants.Professions.ANIMAL_HANDLING,
            location.taskManagement.huntingWorkCall,
            location,
            0,
            [[ColonySim.Game.Constants.Professions.ANIMAL_HANDLING, 10]]);
        return huntingTask;
    };
    this.huntingWorkCall = function(){
        const foodGathered = 3 + Math.floor(Math.random() * 15);;
        const storage = this.location.storage;
        storage.addWares(storage.wares.food,foodGathered);
    };
};
ColonySim.Game.Constructors.Location.TaskManagement.prototype = Object.create(ColonySim.Game.Constructors.Location.TaskManagement.prototype);
ColonySim.Game.Constructors.Location.TaskManagement.prototype.constructor = ColonySim.Game.Constructors.Location.TaskManagement;

ColonySim.Game.Generator =  {
    citizenName(){
        const mFirst = ["John","Mark","Peter","Nathaniel","Jordan","Michael","Constantin"];
        const wFirst = ["Sarah","Selena","Robin","Victoria","Marion","Judith","Frederica","Rebecca"];

        let name = "";

        if (Math.random() > 0.5){
            name = mFirst[Math.floor(Math.random() * mFirst.length)]
        } else {
            name = wFirst[Math.floor(Math.random() * wFirst.length)]
        }
        return name;
    },
    citizenProfession(){
        return ColonySim.Game.Constants.ProfessionsArray[Math.floor(Math.random() * ColonySim.Game.Constants.ProfessionsArray.length)];
    },
    citizen(settlement){
        let citizen = new ColonySim.Game.Constructors.Citizen(this.citizenName(), this.citizenProfession(), settlement);
        return citizen;
    },
    citizens(amount,settlement){
        if (amount === undefined){
            return [];
        }
        const citizens = [];
        for (let i = 0; i < amount; i++) {
            citizens.push(this.citizen(settlement));
        }
        return citizens;
    }
};

ColonySim.Game.Controls = {
    requestMainAnimationFrame: undefined,
    stopMain() { window.cancelAnimationFrame(ColonySim.Game.Controls.requestMainAnimationFrame); },
    lastTick: window.performance.now(),
    tickLength: 100,
    lastRender: window.performance.now(),
    frameLength: 30,
    isPlaying: false,
    play(){
        this.lasTick = this.lastRender = window.performance.now();
        this.isPlaying=true;
    },
    pause(){
        this.isPlaying=false;
    },
    playToggle(){
        if(this.isPlaying){
            this.pause();
        } else {
            this.play();
        }
    },
    update(){
        if(ColonySim.Game.Controls.isPlaying){
            this.citizensTick();
        }
    },
    citizensTick(){
        ColonySim.Core.DataManagement.Citizens.data.forEach(citizen => {
            citizen.tick();
        })
    }
};