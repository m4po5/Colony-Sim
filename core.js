const ProfessionsArray = Object.freeze(["Agriculture", "Construction", "Animal Handling"]);
const Professions = Object.freeze({
    AGRICULTURE: ProfessionsArray[0],
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
    this.upgrades = {sheltered: false}
}

function Location(name,storage){
    this.name = name;
    this.storage = storage;
    this.tasks = [];
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
    this.findTaskToPlan = function(profession){
        let taskToPlan = undefined;
        const tasksOverview = this.tasksOverview().filter(task => task.profession===profession);
        const runningTasks = this.tasks.filter(t => t.profession === profession);
        tasksOverview.forEach(task => {
            const runningTask = runningTasks.filter(rTask => rTask.name===task.name);
            if (runningTask.length<task.max){
                taskToPlan=task.call(this);
            }
        })
        return taskToPlan;
    };
}

function Citizen(name, profession, settlement){
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
    this.seekWorkCall = function(){
        let citizen = this.assignee;
        let availableTask = undefined;
        this.location.tasks.forEach(task => {
            if (task.assignee === undefined && task.profession === citizen.profession && !task.done && availableTask === undefined){
                availableTask = task;
            }
        })
        if (availableTask !== undefined){
            citizen.assignTask(availableTask);
        }
    }
    this.createSeekWorkTask = function(location){
        return new Task("Seeking Work",30,this.profession,this.seekWorkCall,location,0);
    }
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
    this.tasks = [];
    this.citizens = [];
    this.buildings = [];
    this.tasksOverview = function(){
        const gatheringWoodTask = {
            name:"Gathering Wood",
            profession:Professions.AGRICULTURE,
            max:3,
            call:this.createTaskGatheringWood
        };
        const gatheringFoodTask = {
            name:"Gathering Food",
            profession:Professions.AGRICULTURE,
            max:4,
            call:this.createTaskGatheringFood
        }
        const huntingTask = {
            name:"Hunting",
            profession:Professions.ANIMAL_HANDLING,
            max:2,
            call:this.createTaskHunting
        }
        return [gatheringWoodTask,gatheringFoodTask,huntingTask];
    };
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
        location.tasks.forEach(task => {
            if(task.profession === profession){
                result = true;
            }
        });
        return result;
    };
    this.sortLocationByMinLevelRequired = function(locations){
        return locations.sort((a,b) => b.minLevelRequired() - a.minLevelRequired());
    };
    this.createOverseeTask = function(profession){
        let task = new Task("Overseeing "+profession,
            10,
            profession,
            this.overseeingWorkCall,
            this,
            0)
        task.perpetual = true;
        return task;
    };
    this.overseeingWorkCall = function(){
        let tasksDone = this.location.tasksDone(this.profession).filter(t => t!==this);
        let taskToPlan = undefined;
        let ass = this.assignee;
        let workTask = undefined;
        if ((taskToPlan = this.location.findTaskToPlan(this.profession))!==undefined){
            this.location.tasks.push(taskToPlan);
        } else if(tasksDone.length > 0){
            this.location.removeTask(tasksDone[0]);
        } else if((workTask=this.location.tasks.filter(t => t.profession === ass.profession && t.assignee === undefined)[0]) !== undefined){
            ass.assignTask(workTask,true);
        } else {
            ass.planIdleTask(true);
        }
    };
    this.createTaskGatheringWood = function(location){
        const gatheringWoodTask = new Task("Gathering Wood",
            60,
            Professions.AGRICULTURE,
            location.gatheringWoodWorkCall,
            location,
            0,
            [[Professions.AGRICULTURE, 10]]);
        return gatheringWoodTask;
    };
    this.gatheringWoodWorkCall = function(){
        const woodGathered = 5;
        const storage = this.location.storage;
        const capacity = storage.maxStorage.wood - storage.stored.wood;
        if(capacity < woodGathered){
            storage.stored.wood = storage.maxStorage.wood;
        } else {
            storage.stored.wood += woodGathered;
        }
    };
    this.createTaskGatheringFood = function(location){
        const gatheringFoodTask = new Task("Gathering Food",
            50,
            Professions.AGRICULTURE,
            location.gatheringFoodWorkCall,
            location,
            0,
            [[Professions.AGRICULTURE, 10]]);
        return gatheringFoodTask;
    };
    this.gatheringFoodWorkCall = function(){
        const foodGathered = 5;
        const storage = this.location.storage;
        const capacity = storage.maxStorage.food - storage.stored.food;
        if(capacity < foodGathered){
            storage.stored.food = storage.maxStorage.food;
        } else {
            storage.stored.food += foodGathered;
        }
    };
    this.createTaskHunting = function(location){
        const huntingTask = new Task("Hunting",
            120,
            Professions.ANIMAL_HANDLING,
            location.huntingWorkCall,
            location,
            0,
            [[Professions.ANIMAL_HANDLING, 10]]);
        return huntingTask;
    };
    this.huntingWorkCall = function(){
        const foodGathered = 15;
        const storage = this.location.storage;
        const capacity = storage.maxStorage.food - storage.stored.food;
        if(capacity < foodGathered){
            storage.stored.food = storage.maxStorage.food;
        } else {
            storage.stored.food += foodGathered;
        }
    }
}
Settlement.prototype = Object.create(Location.prototype);//Inherits methods
Settlement.prototype.constructor = Settlement;

//-------------- Presets --------------

const pieces = {
    settlement: undefined,
    forester: new Location("Forester"),
    init(){
        this.settlement = new Settlement("Settlement", this.getSettlementStorage());
        this.settlement.addTask(this.settlement.createOverseeTask(Professions.AGRICULTURE));
        this.settlement.addTask(this.settlement.createOverseeTask(Professions.ANIMAL_HANDLING));
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

const core = {
    generate: {
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
    },
    addTask:{
        gathering(){
            pieces.settlement.addTask(pieces.settlement.createTaskGatheringFood());
            pieces.settlement.addTask(pieces.settlement.createTaskGatheringWood());
        },
        hunting(){
            pieces.settlement.addTask(pieces.settlement.createTaskHunting());
        },
        foresting(location){
            const forestingTask = new Task("Foresting",
                80,
                Professions.AGRICULTURE,
                undefined,
                location,
                2,
                [[Professions.AGRICULTURE, 20],[Professions.CONSTRUCTION,5]]);
            forestingTask.location = pieces.forester;
            pieces.forester.addTask(forestingTask);
        },
        random(amount){
            for (let i = 0; i < amount; i++) {
                let rnd = Math.random();
                if(rnd<0.6) { this.gathering()}
                else if(rnd<0.8) { this.hunting()}
                else {this.foresting(pieces.forester)}
            }
        }
    }
}

core.generate.citizens(7,pieces.settlement);
pieces.settlement.citizens.forEach(cit => {if(cit.profession === Professions.CONSTRUCTION){cit.profession = Professions.AGRICULTURE}});

// ----------- Game View and Main Coil ---------

function updateSettlementView(){
    $("#Settlement").empty();

    updateStorage();

    const citizensView = $(`<div class="citizens"></div>`);
    pieces.settlement.citizens.forEach(citizen => {
        citizensView.append(createCitizenView(citizen));
    })
    $("#Settlement").append(citizensView);

    const locationsView = $(`<div class="locations"></div>`);
    locationsView.append(createLocationView(pieces.settlement));
    pieces.settlement.buildings.forEach(location => {
        locationsView.append(createLocationView(location));
    })
    $("#Settlement").append(locationsView);
}

function updateStorage(){
    $("#wood").text(pieces.settlement.storage.stored.wood);
    $("#food").text(pieces.settlement.storage.stored.food);
}

function createCitizenView(citizen){
    let html = `<div class="citizen">`;
    html += `<div class="name">`+citizen.name+`</div>`;
    html += `<div class="profession">`+citizen.profession+`</div>`;

    html += `<div class="task">`
    if (citizen.tasks.length > 0){
        let task = citizen.tasks[0];
        html += task.name;
    } else {
        html += `idling`;
    }
    html += `</div>`

    return html+"</div>";
}

function createLocationView(location){
    let html = `<div class="location">`;
    html += `<div class="name">`+location.name+`</div>`;

    location.tasks.forEach(task =>{
        html += `<div class="task"><div class="progress">`+task.name+`<div class="progressbar `;
        switch (task.status){
            case "In Progress":
                let progress = task.ticksDone/task.ticksToComplete;
                html += `inProgress" style="width:`+ progress*100 +`%">`;
                break
            case "Done":
                html += `done">`;
                break;
            default:
                html += `todo">`;       
        }
        
        html += task.name+`</div></div>`
        if(task.assignee !== undefined){
            html += `<div class="assignee">`+task.assignee.name+`</div>`
        }

        html +=`</div>`;
    })

    return html+"</div>";
}

// ------------------ start Game ----------------

const ColonySim = {
    requestMainAnimationFrame: undefined,
    stopMain() { window.cancelAnimationFrame(ColonySim.requestMainAnimationFrame); },
    lastTick: window.performance.now(),
    tickLength: 100,
    lastRender: window.performance.now(),
    frameLength: 50,
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