//-------------- Presets --------------

const pieces = {
    settlement: undefined,
    forester: new ColonySim.Game.Constructors.Location("forester"),
    init(){ // has to go into some sort of factory,
    // even if I could put it into the constructor function,
    // I don't want to see new Stuff().init()!
    // Though this should evaporate as soon as I
    // design a proper module around my game.
        this.settlement = new ColonySim.Game.Constructors.Settlement("settlement", this.getSettlementStorage());
        this.settlement.taskManagement.createOverseeTask(ColonySim.Game.Constants.Professions.HAULING);
        this.settlement.taskManagement.createOverseeTask(ColonySim.Game.Constants.Professions.ANIMAL_HANDLING);
        this.settlement.addBuilding(this.forester);
    },
    getSettlementStorage(){
        const storage = new ColonySim.Game.Constructors.Storage();
        storage.accepts.food=true;
        storage.accepts.wood=true;

        storage.maxStorage.food = 100;
        storage.maxStorage.wood = 100;

        return storage;
    }
};
pieces.init();

// Game Initialization
ColonySim.Game.Generator.citizens(7,pieces.settlement);
ColonySim.Core.DataManagement.Citizens.data.forEach(cit => {if(cit.profession === ColonySim.Game.Constants.Professions.CONSTRUCTION){cit.profession = ColonySim.Game.Constants.Professions.HAULING}});

// ----------------- Start Game -----------------

ColonySim.Log = {};
ColonySim.Log.FPS = {
    print: false,
    lastLog: null,
    lastPrint: null,
    timeToNextPrint: 1000,
    graph: [],
    graphMax: 10,
    addFPS: function(fps){
        const lFps = ColonySim.Log.FPS;
        lFps.graph.push(fps);
        if(lFps.graph.length > lFps.graphMax){
            lFps.graph.shift();
        };
    },
    log: function(tFrame){
        const lFps = ColonySim.Log.FPS;
        if(lFps.print === false){
            return;
        }
        if(lFps.lastLog !== null) {lFps.addFPS(tFrame-lFps.lastLog)}
        lFps.lastLog = tFrame;
        if ((tFrame - lFps.lastPrint) >= lFps.timeToNextPrint){
            console.log("FPS: " + Math.floor(1000/lFps.getMedian()));
            lFps.lastPrint = tFrame;
        }
    },
    getMedian: function(){
        const lFps = ColonySim.Log.FPS;
        if(lFps.graph.length === 0){
            return;
        }
        const sortedGraph = lFps.graph.sort((a,b) => a - b);
        const halfPoint = Math.floor(sortedGraph.length / 2);
        return (lFps.graph.length % 2 ? 
            lFps.graph[halfPoint]:
            (sortedGraph[halfPoint-1] + sortedGraph[halfPoint]) / 2
        );
    }
};

// inspiration from source: https://developer.mozilla.org/en-US/docs/Games/Anatomy#building_a_main_loop_in_javascript
; (() => {
    function main(tFrame) {
        ColonySim.Game.Controls.requestMainAnimationFrame = window.requestAnimationFrame(main);
        
        const nextTick = ColonySim.Game.Controls.lastTick + ColonySim.Game.Controls.tickLength;
        let numTicks = 0;
        if (tFrame > nextTick) {
            const timeSinceTick = tFrame - ColonySim.Game.Controls.lastTick;
            numTicks = Math.floor(timeSinceTick / ColonySim.Game.Controls.tickLength);
        }

        queueUpdates(numTicks);
        
        const timeSinceRender = tFrame - ColonySim.Game.Controls.lastRender
        if(timeSinceRender > ColonySim.Game.Controls.frameLength){
            ColonySim.UI.update();
            ColonySim.Log.FPS.log(tFrame);
            ColonySim.Game.Controls.lastRender = tFrame;
        }
    }

    function queueUpdates(numTicks) {
        for (let i = 0; i < numTicks; i++) {
            ColonySim.Game.Controls.lastTick += ColonySim.Game.Controls.tickLength;
            ColonySim.Game.Controls.update(ColonySim.Game.Controls.lastTick);
        }
    }
    ColonySim.Game.Controls.lastTick = performance.now();
    ColonySim.Game.Controls.lastRender = ColonySim.Game.Controls.lastTick;
    ColonySim.Game.Controls.tickLength = 100;
    //setInitialState();//Performs whatever tasks are leftover before the main loop must run. My game Setup.
    main(); // Start the cycle
})();