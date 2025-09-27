// ----------- Game View ---------

function updateSettlementView(){
    updateStorage();
    updateCitizenViews()
    updateLocationViewsNewTasks();
    updateCitizensCurrentTask();
    updateLocationViewRemovedTasks();
};

function updateStorage(){
    $("#wood").text(pieces.settlement.storage.stored.wood);
    $("#food").text(pieces.settlement.storage.stored.food);
};

//---- Citizen UI -----
function onCitizenAddedEvent(citizen){
    const citView = createCitizenView(citizen);
    $("#citizens").append(citView);
};
ColonySim.DataManagement.Citizens.addEvent.addHandler(onCitizenAddedEvent);

function onCitizenRemovedEvent(citizen){
    $("#"+citizen.id).remove();
};
ColonySim.DataManagement.Citizens.removeEvent.addHandler(onCitizenRemovedEvent);

function updateCitizenViews(){
    ColonySim.DataManagement.Citizens.data.forEach((dc) => {
        let taskText = `<div class="progress">idling</div>`;
        if(dc.tasks.length > 0){
            const task = dc.tasks[0];
            taskText = getTaskProgressView(task);
        }
        $("#"+dc.id).children(".nameplate").children(".task").html(taskText)
    });
};

function createCitizenView(citizen){
    let html = `<div id="`+citizen.id+`" class="citizen">`;
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
};

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
};

//---- Location UI -----
function createLocationView(location){
    let html = `<div id="`+location.id+`" class="location">`;
    html += `<div class="name">`+location.name+`</div>`;
    html += `<div class="tasks">`

    location.taskManagement.tasks.forEach(task =>{
        html += createTaskView(task, html);
    })

    html += `</div>`;//closing tasks div

    return html+"</div>";
};

function onLocationAddedEvent(location){
    const locView = createLocationView(location);
    $("#locations").append(locView);
};
ColonySim.DataManagement.Locations.addEvent.addHandler(onLocationAddedEvent);

function onLocationRemovedEvent(id){
    $("#"+id).remove();
};
ColonySim.DataManagement.Locations.removeEvent.addHandler(onLocationRemovedEvent);

function updateLocationViewsNewTasks(){
    const toCreateIds = ColonySim.ViewBuffers.Tasks.toCreate.readIdSets();
    toCreateIds.forEach(set => {
        let taskId = set[0];
        const task = ColonySim.DataManagement.Tasks.getDataById(taskId);
        const location = task.location;
        if (location !== undefined){
            $("#"+location.id).children(".tasks").append(createTaskView(task));
        }
    });
};

function updateLocationViewRemovedTasks(){
    const toRemoveIds = ColonySim.ViewBuffers.Tasks.toRemove.readIdSets();
    toRemoveIds.forEach(set => {
        let taskId = set[0];
        $("#citizens").append($("#"+taskId).children(".assignee").children(".citizen"))
        $("#"+taskId).remove();
    });
};

function createTaskView(task) {
    let html = "";
    html += `<div id="` + task.id + `" class="task">`;
    html += `<span class="name">` + task.name + `</span>`;
    html += `<hr>`;
    html += `<div class="assignee"></div>`;
    html += `</div>`; //close task div
    return html;
};

// ----- Citizen Task Allocation ----
function updateCitizensCurrentTask(){
    const cct = ColonySim.ViewBuffers.Citizens.toChangeCurrentTask.readIdSets();
    cct.forEach(set => {
        let citizenId = set[0];
        let taskId = set[1];
        if ($("#"+taskId).length !== 0){
            $("#"+taskId).children(".assignee").append($("#"+citizenId));
        } else {
            $("#citizens").append($("#"+citizenId));
        }
    });
};