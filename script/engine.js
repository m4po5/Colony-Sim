const Engine = {
    init: function(){
        $("<div>")
            .attr("id","timer")
            .text("10:00")
            .appendTo("#content");
        $("<div>")
            .attr("id","inventory")
            .text("Inventory")
            .appendTo("#content");
        $("<div>")
            .attr("id","score")
            .text("$0000")
            .appendTo("#content");
        $("<div>")
            .attr("id","workshops")
            .text("list workshops")
            .appendTo("#content");
        $("<div>")
            .attr("id","details")
            .text("workshop details...")
            .appendTo("#content");
        $("<div>")
            .attr("id","cmdHelper")
            .text("command help and info")
            .appendTo("#content");
        $("<div>")
            .attr("id","cmdLine")
            .text("cmd line")
            .appendTo("#content");
        $("<div>")
            .attr("id","log")
            .text("logging messages here...")
            .appendTo("#content");

        // init sub-modules here
    }
}

Engine.init();