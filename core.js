const ProfessionsArray = Object.freeze(["Hauling", "Construction", "Animal Handling"]);
const Professions = Object.freeze({
    HAULING: ProfessionsArray[0],
    CONSTRUCTION: ProfessionsArray[1],
    ANIMAL_HANDLING: ProfessionsArray[2]
})

function Task(name, ticksToComplete, profession, workCall, location,minLevelRequired, expYield){
    this.name = name;
    this.ticksToComplete = ticksToComplete;
    this.ticksDone = 0;
    this.profession = profession;
    this.workCall = workCall;
    this.location = location;
    this.minLevelRequired = minLevelRequired;
    this.expYield = expYield;
    this.status = "To Do"
    this.done = false;
    this.perpetual = false;
    this.assignee = undefined;
    this.location = location;
    this.work = function(){
        this.progress();
        if(this.done && typeof this.workCall === "function"){
            this.workCall();
            if (this.perpetual === true){
                this.reset();
            }
        }
    };
    this.progress = function(){
        if(this.done){
            return;
        }
        this.ticksDone += 1;
        this.status = "In Progress"
        if (this.ticksDone === this.ticksToComplete){
            this.status = "Done"
            this.done = true;
        }
    }
    this.reset = function(){
        this.ticksDone = 0;
        this.done = false;
        this.status = "ToDo";
    }
}

const Wares= Object.freeze({wood:"Wood",food:"Food"});

function csStorage(){
    this.wares = Wares;
    this.accepts = {wood:false,food:false};
    this.maxStorage = {wood:50,food:50}
    this.stored = {wood:0,food:0};
}

function Location(name,storage){
    this.name = name;
    this.storage = storage;
    this.taskManagement = new Location.TaskManagement(this);
}

Location.TaskManagement = function TaskManagement(location){
    this.location = location;
    this.tasks= [];
    this.tasksOverview = () => { return [{}]};
    this.minLevelRequired = function(){
        let minLevel = 10;
        this.tasks.forEach(task => {
            if(task.minLevelRequired < minLevel){
                minLevel = task.minLevelRequired;
            }
        })
        return minLevel;
    };
    this.addTask = function(task,unshift){
        if(unshift){
            this.tasks.unshift(task);
        } else {
            this.tasks.push(task);
        }
    };
    this.removeTask = function(task){
        this.tasks = this.tasks.filter(t => t !== task);
    };
    this.tasksDone = function(profession){
        const tasksDone = this.tasks.filter(t => t.profession === profession && t.done)
        return tasksDone;
    };
    this.getTaskToPlan = function(profession){
        let taskToPlan = undefined;
        const tasksOverview = this.tasksOverview().filter(task => task.profession===profession);
        const runningTasks = this.tasks.filter(t => t.profession === profession);
        tasksOverview.forEach(task => {
            if(task.isNeeded(this.location)){
                const runningTask = runningTasks.filter(rTask => rTask.name===task.name);
                if (runningTask.length<task.max){
                    taskToPlan=task.call(this.location);
                }
            }
        })
        return taskToPlan;
    };
    this.getSurplusTasks = function(profession){
        const surplusTasks = [];
        const tasksOverview = this.tasksOverview().filter(task => task.profession===profession);
        const runningTasks = this.tasks.filter(t => t.profession === profession);
        tasksOverview.forEach(t => {
            if (!t.isNeeded(this.location)){
                surplusTasks.push(...runningTasks.filter(r => r.name === t.name));
            };
        });
        return surplusTasks;
    },
    this.getAvailableTasksFor = function(profession){
        return this.tasks.filter(task => task.assignee === undefined && task.profession === profession && !task.done);
    };
}

function Citizen(name, profession, settlement){
    Citizen.numInstances = (Citizen.numInstances || 0) + 1;
    this.citId = Citizen.numInstances;
    this.name = "J. Doe";
    if (name !== undefined){
        this.name = name;
    }
    this.profession = profession;
    this.settlement = settlement;
    this.tasks = [];
    this.assignTask = function(task,unshift){
        if(unshift){
            this.tasks.unshift(task);
        } else {
            this.tasks.push(task);
        }
        task.assignee = this;
    }
    this.unAssignTask = function(task){
        this.tasks = this.tasks.filter(t => t !== filter)
    }
    this.tick = function(){
        
        if (this.tasks.length != 0){
            this.tasks[0].work();
            this.tasks = this.tasks.filter(el => !el.done);
        }
        else {
            let availableLocations = this.settlement.getLocationsByProfession(this.profession);

            if (availableLocations.length !== 0){
                let sortedLocations = this.settlement.sortLocationByMinLevelRequired(availableLocations);
                
                sortedLocations.forEach(loc => {
                    this.planSeekWorkTask(loc);
                })

                this.tick();
            }
        }
    };
    this.createSeekWorkTask = function(location){
        return new Task("Seeking Work",30,this.profession,this.seekWorkCall,location,0);
    };
    this.seekWorkCall = function(){
        let citizen = this.assignee;
        let availableTasks = undefined;

        availableTasks = this.location.taskManagement.getAvailableTasksFor(this.profession);
        if (availableTasks.length > 0){
            citizen.assignTask(availableTasks[0]);
        }
    };
    this.createIdleTask = function(){
        let idleTypes = ["Stargazing","Strolling","Picking Flowers","Watching People Work","Whistling a tune"];
        let idleType = idleTypes[Math.floor(Math.random() * idleTypes.length)];
        return new Task(idleType,60);
    }
    this.planSeekWorkTask = function(location,unshift){
        this.assignTask(this.createSeekWorkTask(location,unshift));
    }
    this.planIdleTask = function(unshift){
        let IdleTask = this.createIdleTask();
        this.assignTask(IdleTask,unshift);
    }
}

function Settlement(name, storage){
    Location.call(this,name, storage);
    this.taskManagement = new Settlement.TaskManagement(this);
    this.citizens = [];
    this.buildings = [];
    this.addCitizen = function(citizen){
        if(citizen instanceof Citizen){
            this.citizens.push(citizen);   
        }
    };
    this.addBuilding = function (building){
        if (building instanceof Location){
            this.buildings.push(building)
        } else {
            console.error("Settlement.addBuilding: object is not of instance Location")
        }
    };
    this.getLocationsByProfession = function(profession){
        const locations = [];
        if (this.locationOfProfession(pieces.settlement,profession)){
            locations.push(pieces.settlement);
        }
        pieces.settlement.buildings.forEach(building => {
            if (this.locationOfProfession(building,profession)){
                locations.push(building);
            }
        });
        
        return locations;
    };
    this.locationOfProfession = function(location,profession){
        let result = false;
        location.taskManagement.tasks.forEach(task => {
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
Settlement.prototype = Object.create(Location.prototype);//Inherits methods
Settlement.prototype.constructor = Settlement;

Settlement.TaskManagement = function TaskManagement(location){
    Location.TaskManagement.call(this,location);
    this.tasks = [];
    this.tasksOverview = function(){
    const gatheringWoodTask = {
        name:"Gathering Wood",
        profession:Professions.HAULING,
        max:4,
        isNeeded:this.isTaskGatheringWoodNeeded,
        call:this.createTaskGatheringWood
    };
    const gatheringFoodTask = {
        name:"Gathering Food",
        profession:Professions.HAULING,
        max:1,
        isNeeded:this.isTaskGatheringFoodNeeded,
        call:this.createTaskGatheringFood
    }
    const huntingTask = {
        name:"Hunting",
        profession:Professions.ANIMAL_HANDLING,
        max:3,
        isNeeded:this.isTaskHuntingNeeded,
        call:this.createTaskHunting
    }
    return [gatheringWoodTask,gatheringFoodTask,huntingTask];
    };
    this.createOverseeTask = function(profession){
        let task = new Task("Overseeing "+profession,
            10,
            profession,
            this.overseeingWorkCall,
            this.location,
            0)
        task.perpetual = true;
        return task;
    };
    this.overseeingWorkCall = function(){
        let tasksDone = this.location.taskManagement.tasksDone(this.profession).filter(t => t!==this);
        let tasksToCancel = this.location.taskManagement.getSurplusTasks(this.profession);
        let taskToPlan = undefined;
        let ass = this.assignee;
        let workTask = undefined;
        if (tasksToCancel.length > 0){
            this.location.taskManagement.removeTask(tasksToCancel[0]);
        } else if ((taskToPlan = this.location.taskManagement.getTaskToPlan(this.profession))!==undefined){
            this.location.taskManagement.addTask(taskToPlan);
        } else if(tasksDone.length > 0){
            this.location.taskManagement.removeTask(tasksDone[0]);
        } else if((workTask=this.location.taskManagement.tasks.filter(t => t.profession === ass.profession && t.assignee === undefined)[0]) !== undefined){
            ass.assignTask(workTask,true);
        } else {
            ass.planIdleTask(true);
        }
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
        const gatheringWoodTask = new Task("Gathering Wood",
            90,
            Professions.HAULING,
            location.taskManagement.gatheringWoodWorkCall,
            location,
            0,
            [[Professions.HAULING, 10]]);
        return gatheringWoodTask;
    };
    // Called within Task object
    this.gatheringWoodWorkCall = function(){
        const woodGathered = 1 + Math.floor(Math.random() * 3);
        const storage = this.location.storage;
        storage.stored.wood += woodGathered;
    };
    this.isTaskGatheringFoodNeeded = function(location){
        if (location.storage.stored.food <= location.storage.maxStorage.food){
            return true;
        } else {
            return false;
        }
    };
    this.createTaskGatheringFood = function(location){
        const gatheringFoodTask = new Task("Gathering Food",
            60,
            Professions.HAULING,
            location.taskManagement.gatheringFoodWorkCall,
            location,
            0,
            [[Professions.HAULING, 10]]);
        return gatheringFoodTask;
    };
    this.gatheringFoodWorkCall = function(){
        const foodGathered = 2 + Math.floor(Math.random() * 2);
        const storage = this.location.storage;
        storage.stored.food += foodGathered;
    };
    this.isTaskHuntingNeeded = function(location){
        if (location.storage.stored.food <= location.storage.maxStorage.food){
            return true;
        } else {
            return false;
        }
    };
    this.createTaskHunting = function(location){
        const huntingTask = new Task("Hunting",
            300,
            Professions.ANIMAL_HANDLING,
            location.taskManagement.huntingWorkCall,
            location,
            0,
            [[Professions.ANIMAL_HANDLING, 10]]);
        return huntingTask;
    };
    this.huntingWorkCall = function(){
        const foodGathered = 3 + Math.floor(Math.random() * 15);;
        const storage = this.location.storage;
        storage.stored.food += foodGathered;
    };
};
Location.TaskManagement.prototype = Object.create(Location.TaskManagement.prototype);
Location.TaskManagement.prototype.constructor = Location.TaskManagement;

//-------------- Presets --------------

const pieces = {
    settlement: undefined,
    forester: new Location("Forester"),
    init(){
        this.settlement = new Settlement("Settlement", this.getSettlementStorage());
        this.settlement.taskManagement.addTask(this.settlement.taskManagement.createOverseeTask(Professions.HAULING));
        this.settlement.taskManagement.addTask(this.settlement.taskManagement.createOverseeTask(Professions.ANIMAL_HANDLING));
        this.settlement.addBuilding(this.forester);
    },
    getSettlementStorage(){
        const storage = new csStorage();
        storage.accepts.food=true;
        storage.accepts.wood=true;

        storage.maxStorage.food = 100;
        storage.maxStorage.wood =100;

        return storage;
    }
}
pieces.init();

const Generator = {
    citizen(settlement){
        const mFirst = ["John","Mark","Peter","Nathaniel","Jordan","Michael","Constantin"];
        const wFirst = ["Sarah","Selena","Robin","Victoria","Marion","Judith","Frederica","Rebecca"];
        const profession = ProfessionsArray[Math.floor(Math.random() * ProfessionsArray.length)];

        let name = "";

        if (Math.random() > 0.5){
            name = mFirst[Math.floor(Math.random() * mFirst.length)]
        } else {
            name = wFirst[Math.floor(Math.random() * wFirst.length)]
        }

        let citizen = new Citizen(name, profession, settlement);
        settlement.addCitizen(citizen);
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

Generator.citizens(7,pieces.settlement);
pieces.settlement.citizens.forEach(cit => {if(cit.profession === Professions.CONSTRUCTION){cit.profession = Professions.HAULING}});

// ------------------ start Game ----------------

const ColonySim = {
    requestMainAnimationFrame: undefined,
    stopMain() { window.cancelAnimationFrame(ColonySim.requestMainAnimationFrame); },
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
        if(ColonySim.isPlaying){
            this.citizensTick();
        }
    },
    citizensTick(){
        pieces.settlement.citizens.forEach(citizen => {
            citizen.tick();
        })
}
}

// inspiration from source: https://developer.mozilla.org/en-US/docs/Games/Anatomy#building_a_main_loop_in_javascript
; (() => {
    function main(tFrame) {
        ColonySim.requestMainAnimationFrame = window.requestAnimationFrame(main);
        
        const nextTick = ColonySim.lastTick + ColonySim.tickLength;
        let numTicks = 0;
        if (tFrame > nextTick) {
            const timeSinceTick = tFrame - ColonySim.lastTick;
            numTicks = Math.floor(timeSinceTick / ColonySim.tickLength);
        }

        queueUpdates(numTicks);
        
        const timeSinceRender = tFrame - ColonySim.lastRender
        if(timeSinceRender > ColonySim.frameLength){
            updateSettlementView();
            ColonySim.lastRender = tFrame;
        }
    }

    function queueUpdates(numTicks) {
        for (let i = 0; i < numTicks; i++) {
            ColonySim.lastTick += ColonySim.tickLength;
            ColonySim.update(ColonySim.lastTick);
        }
    }
    ColonySim.lastTick = performance.now();
    ColonySim.lastRender = ColonySim.lastTick;
    ColonySim.tickLength = 100;
    //setInitialState();//Performs whatever tasks are leftover before the main loop must run. My game Setup.
    main(); // Start the cycle
})();