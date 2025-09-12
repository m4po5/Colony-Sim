// Game Initialization
Generator.citizens(7,pieces.settlement);
ColonySim.Data.Citizens.array.forEach(cit => {if(cit.object.profession === Professions.CONSTRUCTION){cit.object.profession = Professions.HAULING}});

// ----------------- Start Game -----------------

// inspiration from source: https://developer.mozilla.org/en-US/docs/Games/Anatomy#building_a_main_loop_in_javascript
; (() => {
    function main(tFrame) {
        ColonySim.GameControls.requestMainAnimationFrame = window.requestAnimationFrame(main);
        
        const nextTick = ColonySim.GameControls.lastTick + ColonySim.GameControls.tickLength;
        let numTicks = 0;
        if (tFrame > nextTick) {
            const timeSinceTick = tFrame - ColonySim.GameControls.lastTick;
            numTicks = Math.floor(timeSinceTick / ColonySim.GameControls.tickLength);
        }

        queueUpdates(numTicks);
        
        const timeSinceRender = tFrame - ColonySim.GameControls.lastRender
        if(timeSinceRender > ColonySim.GameControls.frameLength){
            updateSettlementView();
            ColonySim.GameControls.lastRender = tFrame;
        }
    }

    function queueUpdates(numTicks) {
        for (let i = 0; i < numTicks; i++) {
            ColonySim.GameControls.lastTick += ColonySim.GameControls.tickLength;
            ColonySim.GameControls.update(ColonySim.GameControls.lastTick);
        }
    }
    ColonySim.GameControls.lastTick = performance.now();
    ColonySim.GameControls.lastRender = ColonySim.GameControls.lastTick;
    ColonySim.GameControls.tickLength = 100;
    //setInitialState();//Performs whatever tasks are leftover before the main loop must run. My game Setup.
    main(); // Start the cycle
})();