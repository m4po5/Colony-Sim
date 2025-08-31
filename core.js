const ProfessionsArray = Object.freeze(["Agriculture", "Construction", "Animal Handling"]);
const Professions = Object.freeze({
    AGRICULTURE: ProfessionsArray[0],
    CONSTRUCTION: ProfessionsArray[1],
    ANIMAL_HANDLING: ProfessionsArray[2]
})

function Task(name, timeToComplete, profession, workCall, location,minLevelRequired, expYield){
    this.name = name;
    this.timeToComplete = timeToComplete;
    this.timeLeft = timeToComplete;
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
    this.work = function(time){
        let timeLeft = this.investTime(time);
        if(this.done && typeof this.workCall === "function"){
            if (this.perpetual === true){
                this.done = false;
                this.timeLeft = this.timeToComplete;
            }
            this.workCall();
        }
        return timeLeft;
    };
    this.investTime = function(time){
        if(this.done){
            return time;
        }
        this.timeLeft -= time;
        if (this.timeLeft > 0){
            this.status = "In Progress"
            return 0;
        } else {
            this.status = "Done"
            this.done = true;
            return -this.timeLeft;
        }
    }
}

function Location(name){
    this.name = name;
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
                taskToPlan=task.call();
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
    this.workForDuration = function(time){
        let timeLeft = time;
        
        while(timeLeft > 0 && this.tasks.length != 0){
            timeLeft = this.tasks[0].work(timeLeft);
            this.tasks = this.tasks.filter(el => !el.done);
        }
        if (timeLeft > 0){
            let availableLocations = this.settlement.getLocationsByProfession(this.profession);

            if (availableLocations.length !== 0){
                let sortedLocations = this.settlement.sortLocationByMinLevelRequired(availableLocations);
                
                sortedLocations.forEach(loc => {
                    this.planSeekWorkTask(loc);
                })

                this.workForDuration(timeLeft);
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
        return new Task("Seeking Work",20,this.profession,this.seekWorkCall,location,0);
    }
    this.createIdleTask = function(){
        let idleTypes = ["Stargazing","Strolling","Picking Flowers","Watching People Work"];
        let idleType = idleTypes[Math.floor(Math.random() * idleTypes.length)];
        return new Task(idleType,6);
    }
    this.planSeekWorkTask = function(location,unshift){
        this.assignTask(this.createSeekWorkTask(location,unshift));
    }
    this.planIdleTask = function(unshift){
        let IdleTask = this.createIdleTask();
        this.assignTask(IdleTask,unshift);
    }
}

function Settlement(name){
    Location.call(this,name);
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
        let task = new Task("Overseeing "+profession,5,profession,this.overseeingWorkCall,this,0)
        task.perpetual = true;
        return task;
    };
    this.overseeingWorkCall = function(){
        let tasksDone = this.location.tasksDone(this.profession);
        let taskToPlan = undefined;
        let ass = this.assignee;
        let workTask = undefined;
        if(tasksDone.length > 0){
            this.location.removeTask(tasksDone[0]);
        } else if ((taskToPlan = this.location.findTaskToPlan(this.profession))!==undefined){
            this.location.tasks.push(taskToPlan);
        } else if((workTask=this.location.tasks.filter(t => t.profession === ass.profession && t.assignee === undefined)[0]) !== undefined){
            ass.assignTask(workTask,true);
        } else {
            ass.planIdleTask(true);
        }
    };
    this.createTaskGatheringWood = function(){
            const gatheringWoodTask = new Task("Gathering Wood",
                40,
                Professions.AGRICULTURE,
                undefined,
                this,
                0,
                [[Professions.AGRICULTURE, 10]]);
            gatheringWoodTask.location = this;
            return gatheringWoodTask;
    };
    this.createTaskGatheringFood = function(){
            const gatheringFoodTask = new Task("Gathering Food",
                30,
                Professions.AGRICULTURE,
                undefined,
                this,
                0,
                [[Professions.AGRICULTURE, 10]]);
            gatheringFoodTask.location = this;
            return gatheringFoodTask;
    };
    this.createTaskHunting = function(){
            const huntingTask = new Task("Hunting",
                60,
                Professions.ANIMAL_HANDLING,
                undefined,
                this,
                0,
                [[Professions.ANIMAL_HANDLING, 10]]);
            huntingTask.location = this;
            return huntingTask;
    }
}
Settlement.prototype = Object.create(Location.prototype);//Inherits methods
Settlement.prototype.constructor = Settlement;

//-------------- Presets --------------

const pieces = {
    settlement: new Settlement("Settlement"),
    forester: new Location("Forester"),
    init(){
        this.settlement.addTask(this.settlement.createOverseeTask(Professions.AGRICULTURE));
        this.settlement.addTask(this.settlement.createOverseeTask(Professions.ANIMAL_HANDLING));
        this.settlement.addBuilding(this.forester);
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
                20,
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

$(document).ready(function(Settlement){
    updateSettlementView();
  // jQuery methods go here...
}); 

function updateSettlementView(){
    $("#Settlement").empty();

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
                let progress = 1-task.timeLeft/task.timeToComplete;
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

function main(){
    const timePerTick = 1;
    letCitizensWork(timePerTick);
    updateSettlementView();
}
function letCitizensWork(time){
    pieces.settlement.citizens.forEach(citizen => {
        citizen.workForDuration(time);
    })
}

const game={
    mainInterval: undefined,
    playing: false,
    play(){
        this.mainInterval=setInterval(main,400);
        this.playing=true;
    },
    pause(){
        clearInterval(this.mainInterval)
        this.playing=false;
    },
    playToggle(){
        if(this.playing){
            this.pause();
        } else {
            this.play();
        }
    }
}