//-------------- Presets --------------

const pieces = {
    settlement: undefined,
    forester: new Location("forester"),
    init(){ // has to go into some sort of factory,
    // even if I could put it into the constructor function,
    // I don't want to see new Stuff().init()!
    // Though this should evaporate as soon as I
    // design a proper module around my game.
        this.settlement = new Settlement("settlement", this.getSettlementStorage());
        this.settlement.taskManagement.addTask(this.settlement.taskManagement.createOverseeTask(Professions.HAULING));
        this.settlement.taskManagement.addTask(this.settlement.taskManagement.createOverseeTask(Professions.ANIMAL_HANDLING));
        this.settlement.addBuilding(this.forester);
    },
    getSettlementStorage(){
        const storage = new ColonySimStorage();
        storage.accepts.food=true;
        storage.accepts.wood=true;

        storage.maxStorage.food = 100;
        storage.maxStorage.wood = 100;

        return storage;
    }
}
pieces.init();

// Game Initialization
Generator.citizens(7,pieces.settlement);
ColonySim.DataManagement.Citizens.data.forEach(cit => {if(cit.profession === Professions.CONSTRUCTION){cit.profession = Professions.HAULING}});

// ----------------- Start Game -----------------

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
            updateSettlementView();
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