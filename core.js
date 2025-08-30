const ProfessionsArray = Object.freeze(["Agriculture", "Construction", "Animal Handling"]);
const Professions = Object.freeze({
    AGRICULTURE: ProfessionsArray[0],
    CONSTRUCTION: ProfessionsArray[1],
    ANIMAL_HANDLING: ProfessionsArray[2]
})

function Task(name, timeToComplete, profession, minLevelRequired, expYield){
    this.name = name;
    this.timeToComplete = timeToComplete;
    this.timeLeft = timeToComplete;
    this.profession = profession;
    this.minLevelRequired = minLevelRequired;
    this.expYield = expYield;
    this.status = "To Do"
    this.done = false;
    this.assignee = undefined;
    this.location = undefined;
    this.work = function(time){
        return this.investTime(time);
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
    this.minLevelRequired = function(){
        let minLevel = 10;
        this.tasks.forEach(task => {
            if(task.minLevelRequired < minLevel){
                minLevel = task.minLevelRequired;
            }
        })
        return minLevel;
    }
}

function Citizen(name, profession, settlement){
    this.name = "J. Doe";
    if (name !== undefined){
        this.name = name;
    }
    this.profession = profession;
    this.settlement = settlement;
    this.tasks = [];
    this.assignTask = function(task){
        this.tasks.push(task);
        task.assignee = this;
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
                // This really should create a new task list which is then worked through within this task,
                // but is called like any other task by the Citizen.
                
                sortedLocations.forEach(loc => {
                    this.assignTask(new SeekWorkTask(loc));
                })

                this.workForDuration(timeLeft);
            }
        }
    }
}

function SeekWorkTask(location){
    Task.call(this,"Seeking Work",20); //Inherits properties
    this.location = location;
    this.work = function(time){ //sort of method shadowing, base.method won't be visited.
        let timeLeft = this.investTime(time);
        if(this.done){
            let citizen = this.assignee;
            let availableTask = undefined;
            location.tasks.forEach(task => {
                if (task.assignee === undefined && task.profession === citizen.profession && !task.done && availableTask === undefined){
                    availableTask = task;
                }
            })
            if (availableTask !== undefined){
                citizen.tasks = citizen.tasks.filter(task => !(task instanceof SeekWorkTask));
                citizen.assignTask(availableTask);
            }
        }
        return this.investTime(timeLeft);
    }
}
SeekWorkTask.prototype = Object.create(Task.prototype);//Inherits methods
SeekWorkTask.prototype.constructor = SeekWorkTask;

function Settlement(name){
    Location.call(this,name);
    this.citizens = [];
    this.buildings = [];
    this.addCitizen = function(citizens){
    //unsave, but I'm learning to favour functional progress...
        this.citizens.push(citizens);
    };
    this.getExp = function(category){
        // return sum exp for category of all citizens
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
    }
    this.locationOfProfession = function(location,profession){
        let result = false;
        location.tasks.forEach(task => {
            if(task.profession === profession){
                result = true;
            }
        });
        return result;
    }
    this.sortLocationByMinLevelRequired = function(locations){
        return locations.sort((a,b) => b.minLevelRequired() - a.minLevelRequired());
    }  
}
Settlement.prototype = Object.create(Location.prototype);//Inherits methods
Settlement.prototype.constructor = Settlement;

//-------------- Presets --------------

const pieces = {
    settlement: new Settlement("Settlement"),
    forester: new Location("Forester"),
    init(){
        this.settlement.addBuilding(this.forester);
    }
}
pieces.init();

const core = {
    generate: {
        citizen(settlement){
            const mFirst = ["John","Mark","Peter","Nathaniel","Jordan","Michael"];
            const wFirst = ["Sarah","Selena","Robin","Victoria","Marion","Judith"];
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
            const Gathering = new Task("Gathering",
                30,
                Professions.AGRICULTURE,
                0,
                [[Professions.AGRICULTURE, 10]]);
            Gathering.location = Settlement;
            pieces.settlement.tasks.push(Gathering);
        },
        hunting(){
            const Hunting = new Task("Hunting",
                40,
                Professions.ANIMAL_HANDLING,
                0,[[Professions.ANIMAL_HANDLING, 10]]);
            Hunting.location = Settlement;
            pieces.settlement.tasks.push(Hunting)
        },
        foresting(){
            const Foresting = new Task("Foresting",
                20,
                Professions.AGRICULTURE,
                2,
                [[Professions.AGRICULTURE, 20],[Professions.CONSTRUCTION,5]]);
            Foresting.location = pieces.forester;
            pieces.forester.tasks.push(Foresting);
        },
        random(amount){
            for (let i = 0; i < amount; i++) {
                let rnd = Math.random();
                if(rnd<0.6) { this.gathering()}
                else if(rnd<0.8) { this.hunting()}
                else {this.foresting()}
            }
        }
    }
}

core.generate.citizens(7,pieces.settlement);
pieces.settlement.citizens.forEach(cit => {if(cit.profession === Professions.CONSTRUCTION){cit.profession = Professions.AGRICULTURE}});
core.addTask.random(25);

//create array with all Locations offering Tasks of specific Profession

// ------------- Testing --------------
const todos = [new Task("design",20), new Task("implement",12), new Task("review", 8)]
const giveCitizenTasks = function(citizen, tasks){
    for (i=0;i<tasks.length;i++){
        citizen.tasks.push(new Task(tasks[i].name, tasks[i].timeLeft));
    }
}

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
    const timePerTick = 2;
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
        this.mainInterval=setInterval(main,500);
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