ColonySim.UI = {};

ColonySim.UI.update = function(){
    ColonySim.UI.Adders.update();
    ColonySim.UI.Changers.update();
    ColonySim.UI.Removers.update();
};

ColonySim.UI.Components = {}
ColonySim.UI.Components.citizenNameplate = function(citizen){
    let html = `<div id="`+citizen.id+`" class="citizen">`;
    html += `<div src="citIcon.jpg" class="citIcon"></div>`
    html += `<div class="nameplate">`
    html += `<span class="name">`+citizen.name+`</span>`;
    
    html += `<div class="task">`
    if (citizen.tasks.length > 0){
        let task = citizen.tasks[0];
        html += ColonySim.UI.Components.taskProgressView(task);
    } else {
        html += `<div class="progress">idling</div>`;
    }
    html += `</div></div>` //nameplate and task

    return html+"</div>"; //citizen div
};
ColonySim.UI.Components.taskProgressView = function(task){
    let html = `<div class="progress">`+task.name;
    html += `<div class="progressbar `;
        switch (task.status){ // refactor into Updaters
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
ColonySim.UI.Components.locationTaskOverview = function(location){
    let html = `<div id="`+location.id+`" class="location">`;
    html += `<div class="name">`+location.name+`</div>`;
    html += `<div class="tasks">`

    location.taskManagement.tasks.forEach(task =>{
        html += ColonySim.UI.Components.taskView(task, html);
    })

    html += `</div>`;//closing tasks div

    return html+"</div>";
};
ColonySim.UI.Components.taskView = function(task) {
    let html = "";
    html += `<div id="` + task.id + `" class="task">`;
    html += `<span class="name">` + task.name + `</span>`;
    html += `<hr>`;
    html += `<div class="assignee"></div>`;
    html += `</div>`; //close task div
    return html;
};

ColonySim.UI.Adders = {};
ColonySim.UI.Adders.locationsTasks = function(){
    const toCreateIds = ColonySim.Core.ViewBuffers.AddEvents.tasks.readIdSets();
    toCreateIds.forEach(set => {
        const taskId = set[0];
        const task = ColonySim.Core.DataManagement.Tasks.getDataById(taskId);
        const location = task.location;
        if (location !== undefined){
            $("#"+location.id).children(".tasks").append(ColonySim.UI.Components.taskView(task));
        }
    });
};
ColonySim.UI.Adders.citizens = function(){
    const toCreateIds = ColonySim.Core.ViewBuffers.AddEvents.citizens.readIdSets();
    toCreateIds.forEach(set => {
        const citizenId = set[0];
        const citizen = ColonySim.Core.DataManagement.Citizens.getDataById(citizenId);
        const citView = ColonySim.UI.Components.citizenNameplate(citizen);
        $("#citizens").append(citView);
    });
};
ColonySim.UI.Adders.locations = function(){
    const toCreateIds = ColonySim.Core.ViewBuffers.AddEvents.locations.readIdSets();
    toCreateIds.forEach(set => {
        const locationId = set[0];
        const location = ColonySim.Core.DataManagement.Locations.getDataById(locationId);
        const locView = ColonySim.UI.Components.locationTaskOverview(location);
        $("#locations").append(locView);
    });
};

ColonySim.UI.Adders.update = function(){
    ColonySim.UI.Adders.locationsTasks();
    ColonySim.UI.Adders.citizens();
    ColonySim.UI.Adders.locations();
}

ColonySim.UI.Changers = {};
ColonySim.UI.Changers.storage = function(){
    $("#wood").text(pieces.settlement.storage.stored.wood);
    $("#food").text(pieces.settlement.storage.stored.food);
};
ColonySim.UI.Changers.citizenTaskProgress = function(){
    ColonySim.Core.DataManagement.Citizens.data.forEach((dc) => {
        let taskText = `<div class="progress">idling</div>`;
        if(dc.tasks.length > 0){
            const task = dc.tasks[0];
            taskText = ColonySim.UI.Components.taskProgressView(task);
        }
        $("#"+dc.id).children(".nameplate").children(".task").html(taskText)
    });
};
 ColonySim.UI.Changers.citizensCurrentTask = function(){
    const cct = ColonySim.Core.ViewBuffers.ChangeEvents.Citizens.currentTasks.readIdSets();
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
ColonySim.UI.Changers.update = function(){
    ColonySim.UI.Changers.storage();
    ColonySim.UI.Changers.citizenTaskProgress();
    ColonySim.UI.Changers.citizensCurrentTask();
}

ColonySim.UI.Removers = {};
ColonySim.UI.Removers.locationsTasks = function(){
    const toRemoveIds = ColonySim.Core.ViewBuffers.RemoveEvents.tasks.readIdSets();
    toRemoveIds.forEach(set => {
        let taskId = set[0];
        $("#citizens").append($("#"+taskId).children(".assignee").children(".citizen"))
        $("#"+taskId).remove();
    });
};
ColonySim.UI.Removers.citizens = function(){
    const toRemoveIds = ColonySim.Core.ViewBuffers.RemoveEvents.citizens.readIdSets();
    toRemoveIds.forEach(set => {
        const citId = set[0];
        $("#"+citId).remove();
    });
}
ColonySim.UI.Removers.locations = function(){
    const toRemoveIdSets = ColonySim.Core.ViewBuffers.RemoveEvents.locations.readIdSets();
    toRemoveIdSets.forEach(set => {
        const locId = set[0];
        $("#"+locId).remove();
    });
}
ColonySim.UI.Removers.update = function(){
    ColonySim.UI.Removers.citizens();
    ColonySim.UI.Removers.locationsTasks();
    ColonySim.UI.Removers.locations();
};
