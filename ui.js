// ----------- Game View ---------

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

function onCitizenAddedEvent(citizen){
    const citView = createCitizenView(citizen);
    $("#citizens").append(citView);
}
ColonySim.Data.Citizens.addEvent.addHandler(onCitizenAddedEvent);

function onCitizenRemovedEvent(label){
    $("#"+label).remove();
}
ColonySim.Data.Citizens.removeEvent.addHandler(onCitizenRemovedEvent);

function updateCitizensView(){
    const citizensView = $("#citizens");
    
    // update displayed data
    ColonySim.Data.Citizens.array.forEach((dc) => {
        let taskText = `<div class="progress">idling</div>`;
        if(dc.object.tasks.length > 0){
            const task = dc.object.tasks[0];
            taskText = getTaskProgressView(task);
        }
        $("#"+dc.label).children(".nameplate").children(".task").html(taskText)
    });
}

function createCitizenView(citizenData){
    let html = `<div id="`+citizenData.label+`" class="citizen">`;
    const citizen = citizenData.object;
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