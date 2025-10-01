ColonySim.UI = {};

ColonySim.UI.update = function(){
    ColonySim.UI.Adders.update();
    ColonySim.UI.Changers.update();
    ColonySim.UI.Removers.update();
};

ColonySim.UI.Components = {}
ColonySim.UI.Components.citizenMiniView = function(citizen){
    let citizenView = $(`<div id="`+citizen.id+`" class="citizen"></div>`);
    let citizenNameplateView = $(`<div class="nameplate"></div>`);

    citizenNameplateView.append(`<span class="name">`+citizen.name+`</span>`);
    citizenNameplateView.append($(ColonySim.UI.Components.citizenProgressView()));

    citizenView.append(`<div src="citIcon.jpg" class="citIcon"></div>`);
    citizenView.append(citizenNameplateView);
    return citizenView;
};
ColonySim.UI.Components.citizenProgressView = function(){
    let tName = "idling";
    let progressView = $(`<div class="progress">`+tName+`</div>`);
    
    progressView.append(`<div class="progressbar todo">`+tName+`</div>`);
    return progressView;
};
ColonySim.UI.Components.locationOverview = function(location){
    let locationView = $(`<div id="`+location.id+`" class="location"></div>`);
    let taskView = $(`<div class="tasks"></div>`);
    
    locationView.append(`<div class="name">`+location.name+`</div>`);
    locationView.append(taskView);
    return locationView;
};
ColonySim.UI.Components.locationTaskView = function(task) {
    let taskView = $(`<div id="` + task.id + `" class="task">`);
    taskView.append(`<span class="name">` + task.name + `</span>`);
    taskView.append(`<hr>`);
    taskView.append(`<div class="assignee"></div>`);
    return taskView;
};

ColonySim.UI.Adders = {};
ColonySim.UI.Adders.locationsTasks = function(){
    const toCreateIds = ColonySim.Core.ViewBuffers.AddEvents.tasks.readIdSets();
    toCreateIds.forEach(set => {
        const taskId = set[0];
        const task = ColonySim.Core.DataManagement.Tasks.getDataById(taskId);
        const location = task.location;
        if (location !== undefined){
            $("#"+location.id).children(".tasks").append(ColonySim.UI.Components.locationTaskView(task));
        }
    });
};
ColonySim.UI.Adders.citizens = function(){
    const toCreateIds = ColonySim.Core.ViewBuffers.AddEvents.citizens.readIdSets();
    toCreateIds.forEach(set => {
        const citizenId = set[0];
        const citizen = ColonySim.Core.DataManagement.Citizens.getDataById(citizenId);
        const citView = ColonySim.UI.Components.citizenMiniView(citizen);
        $("#citizens").append(citView);
    });
};
ColonySim.UI.Adders.locations = function(){
    const toCreateIds = ColonySim.Core.ViewBuffers.AddEvents.locations.readIdSets();
    toCreateIds.forEach(set => {
        const locationId = set[0];
        const location = ColonySim.Core.DataManagement.Locations.getDataById(locationId);
        const locView = ColonySim.UI.Components.locationOverview(location);
        $("#locations").append(locView);
    });
};

ColonySim.UI.Adders.update = function(){
    ColonySim.UI.Adders.locations();
    ColonySim.UI.Adders.locationsTasks();
    ColonySim.UI.Adders.citizens();
}

ColonySim.UI.Changers = {};
ColonySim.UI.Changers.Utility = {}
ColonySim.UI.Changers.Utility.replaceTextOnly = function(jqSelector,text){
    jqSelector.contents().filter(function() { return this.nodeType == 3; }).first().replaceWith(text);
};

ColonySim.UI.Changers.storage = function(){
    $("#wood").text(pieces.settlement.storage.stored.wood);
    $("#food").text(pieces.settlement.storage.stored.food);
};
ColonySim.UI.Changers.citizenTaskProgressBarWidth = function(taskProgressBarView, task){
    let progress = task.ticksDone/task.ticksToComplete;
    taskProgressBarView.css("width",progress*100+"%")
}
ColonySim.UI.Changers.citizenTaskStatusClass = function(taskProgressBarView, taskStatus){
    let statusClasses = ["todo","inProgress","done"];
    let status = null;

    switch (taskStatus) {
        case "in progress":
            status = statusClasses.splice(1,1)[0];
            break
        case "done":
            status = statusClasses.splice(2,1)[0];
            break;
        default:
            status = statusClasses.splice(0,1)[0];
    };
    statusClasses.splice(0,0,status);
    taskProgressBarView.addClass(statusClasses[0]);
    taskProgressBarView.removeClass(statusClasses[1]);
    taskProgressBarView.removeClass(statusClasses[2]);
}
ColonySim.UI.Changers.citizenTaskProgress = function(citizen){
    const task = citizen.currentTask;
    const taskProgressView = $("#"+citizen.id).find(".progress");
    const taskProgressBarView = taskProgressView.children(".progressbar");
    let status = "to do";
    if(task !== undefined){
        status = task.status;
        ColonySim.UI.Changers.citizenTaskProgressBarWidth(taskProgressBarView,task);
    };
    ColonySim.UI.Changers.citizenTaskStatusClass(taskProgressBarView,status);
};
ColonySim.UI.Changers.citizensTaskProgress = function(){
    ColonySim.Core.DataManagement.Citizens.data.forEach((citizen) => {
        ColonySim.UI.Changers.citizenTaskProgress(citizen);
    });
};
 ColonySim.UI.Changers.citizensCurrentTask = function(){
    const cct = ColonySim.Core.ViewBuffers.ChangeEvents.Citizens.currentTasks.readIdSets();
    cct.forEach(set => {
        const citizenId = set[0];
        const taskId = set[1];
        const citizenView = $("#"+citizenId);
        const task = ColonySim.Core.DataManagement.Tasks.getDataById(taskId);
        const taskProgressView = citizenView.find(".progress");
        const taskProgressBarView = taskProgressView.children(".progressbar");
        let tName = "idling";

        if (task !== undefined){tName = task.name;};
        ColonySim.UI.Changers.Utility.replaceTextOnly(taskProgressView,tName);
        ColonySim.UI.Changers.Utility.replaceTextOnly(taskProgressBarView,tName);

        if ($("#"+taskId).length !== 0){
            $("#"+taskId).children(".assignee").append(citizenView);
        } else {
            $("#citizens").append(citizenView);
        }
    });
};
ColonySim.UI.Changers.tasksDone = function(){
    const dts = ColonySim.Core.ViewBuffers.ChangeEvents.Tasks.doneTasks.readIdSets();
    dts.forEach(set => {
        const taskId = set[0];
        $("#"+taskId).append(`<span class="checkMark">🗸</span>`);
    })
}
ColonySim.UI.Changers.update = function(){
    ColonySim.UI.Changers.storage();
    ColonySim.UI.Changers.citizensCurrentTask();
    ColonySim.UI.Changers.citizensTaskProgress();
    ColonySim.UI.Changers.tasksDone();
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
    ColonySim.UI.Removers.locations();
    ColonySim.UI.Removers.locationsTasks();
};