// ----------- Game View ---------

function updateSettlementView(){

    updateStorage();
    updateCitizenViews()
    updateLocationViews();
}

function updateStorage(){
    $("#wood").text(pieces.settlement.storage.stored.wood);
    $("#food").text(pieces.settlement.storage.stored.food);
}

//---- Citizen UI -----
function onCitizenAddedEvent(citizen){
    const citView = createCitizenView(citizen);
    $("#citizens").append(citView);
}
ColonySim.Data.Citizens.addEvent.addHandler(onCitizenAddedEvent);

function onCitizenRemovedEvent(label){
    $("#"+label).remove();
}
ColonySim.Data.Citizens.removeEvent.addHandler(onCitizenRemovedEvent);

function updateCitizenViews(){
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

//---- Location UI -----
function onLocationAddedEvent(location){
    const locView = createLocationView(location);
    $("#locations").append(locView);
}
ColonySim.Data.Locations.addEvent.addHandler(onLocationAddedEvent);

function onLocationRemovedEvent(label){
    $("#"+label).remove();
}
ColonySim.Data.Locations.removeEvent.addHandler(onLocationRemovedEvent);

function updateLocationViews(){
    if (ColonySim.ViewBuffer.Tasks.toCreate.length > 0){
        ColonySim.ViewBuffer.Tasks.toCreate.forEach(label => {
            const task = ColonySim.Data.Tasks.getDataByLabel(label);
            const locationData = ColonySim.Data.Locations.getDataByObject(task.object.location);
            if (locationData !== undefined){
                $("#"+locationData.label).children(".tasks").append(createTaskView(task.object));
                ColonySim.ViewBuffer.Tasks.removeToCreateLabel(label);
            }
        });
    }
    if (ColonySim.ViewBuffer.Tasks.toRemove.length > 0){
        ColonySim.ViewBuffer.Tasks.toRemove.forEach(label => {
            $("#"+label).remove();
            ColonySim.ViewBuffer.Tasks.removeToRemoveLabel(label);
        });
    }
}

function createLocationView(locationData){
    let html = `<div id="`+locationData.label+`" class="location">`;
    let loc = locationData.object;
    html += `<div class="name">`+loc.name+`</div>`;
    html += `<div class="tasks">`

    loc.taskManagement.tasks.forEach(task =>{
        html += createTaskView(task, html);
    })

    html += `</div>`;//closing tasks div

    return html+"</div>";
}

function createTaskView(task) {
    let html = "";
    let taskData = ColonySim.Data.Tasks.getDataByObject(task);
    html += `<div id="` + taskData.label + `" class="task">`;
    html += `<span class="name">` + task.name + `</span>`;
    html += `<hr>`;
    html += `<div class="assignee"></div>`;
    html += `</div>`; //close task div
    return html;
}
