
// ----------- Game View and Main Coil ---------

function updateSettlementView(){

    updateStorage();
    updateCitizensView()

    const locationsView = $(`#locations`);
    $(locationsView).empty();
    locationsView.append(createLocationView(pieces.settlement));
    pieces.settlement.locations.forEach(location => {
        locationsView.append(createLocationView(location));
    })
}

function updateStorage(){
    $("#wood").text(pieces.settlement.storage.stored.wood);
    $("#food").text(pieces.settlement.storage.stored.food);
}

const View={
    citizens:[]
}

function updateCitizensView(){
    const citizensView = $("#citizens");

    function updateViewCitizensPairs(citizensView) {
        const citizens = pieces.settlement.citizens;
        if (View.citizens.length === 0 && citizens != 0) {
                createCitizenViewPair(citizensView,citizens[0]);
        }
        pieces.settlement.citizens.forEach(citizen => {
            if (View.citizens.filter(vc => vc.citizenData === citizen).length === 0) {
                createCitizenViewPair(citizensView,citizen);
            }
        });
        function createCitizenViewPair(citizensView,citizen) {
            const citView = createCitizenView(citizen);
            View.citizens.push({ citizenData: citizen, viewId: "#citizenId"+citizen.citId });
            citizensView.append(citView);
        }
        View.citizens.forEach(vc => {
            if(pieces.settlement.citizens.filter(cit => cit === vc.citizenData).length === 0){
                $(vc.viewId).remove();
                const index = View.citizens.indexOf(vc);
                if(index > -1){
                    View.citizens.splice(index,1);
                }
            }
        });
    };
    updateViewCitizensPairs(citizensView)
    
    // update displayed data
    View.citizens.forEach((vc) => {
        let taskText = `<div class="progress">idling</div>`;
        if(vc.citizenData.tasks.length > 0){
            const task = vc.citizenData.tasks[0];
            taskText = getTaskProgressView(task);
        }
        $(vc.viewId).children(".nameplate").children(".task").html(taskText)
    });
}

function createCitizenView(citizen){
    let html = `<div id="citizenId`+citizen.citId+`" class="citizen">`;
    html += `<div src="citIcon.jpg" class="citIcon"></div>`
    html += `<div class="nameplate">`
    html += `<span class="name">`+citizen.name+`</span>`;
    
    html += `<div class="task">`
    if (citizen.tasks.length > 0){
        let task = citizen.tasks[0];
        html += getTaskProgressView(task);
    } else {
        html += `<div class="progress">idling</div>`;
    }
    html += `</div></div>` //nameplate and task

    return html+"</div>"; //citizen div
}

function getTaskProgressView(task){
    let html = `<div class="progress">`+task.name;
    html += `<div class="progressbar `;
        switch (task.status){
            case task.statusMessages.INPROGRESS:
                let progress = task.ticksDone/task.ticksToComplete;
                html += `inProgress" style="width:`+ progress*100 +`%">`;
                break
            case task.statusMessages.DONE:
                html += `done">`;
                break;
            default:
                html += `todo">`;
        }
    return html+= task.name+"</div></div>";
}

function createLocationView(location){
    let html = `<div class="location">`;
    html += `<div class="name">`+location.name+`</div>`;

    location.taskManagement.tasks.forEach(task =>{
        html += `<div class="task"><div class="progress">`+task.name+`</div>`;
        if(task.assignee !== undefined){
            html += `<div class="assignee">`+task.assignee.name+`</div>`
        }

        html +=`</div>`;
    })

    return html+"</div>";
}