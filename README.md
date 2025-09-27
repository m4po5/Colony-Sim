# Colony-Sim
## Roadmap
- [ ] UI Overhaul
  - [x] Merge Task Progress into minimized Citizens View
  - [x] Blackboard per Location
  - [x] Citizens show up in locations where they are performing their tasks.
    - :warning: :bug: ~~Idle Tasks causing non-breaking errors!~~
  - [ ] refactor UI
  - [ ] fix "forgotten Task" issue
  - [ ] add visual to done tasks
  - [ ] Blackboard and Management Tabs per Location
- [ ] Construct Building Task: Design and Implementation
- [ ] Need Food Update
- [ ] Deterioration Of Surplus Wares
- [ ] Concept Profession Tree, Unemployment, Advancement and Career Change
- [ ] Taverns and Entertainment for the Workers

## Technical Desicions
### Main Loop
- Decoupled from UI to allow Browser go to sleep and the game to catch up with time when the user tabs back in.
- :exclamation: Careful use of Events is advised to prevent bombarding the browser in that scenario!

### Custom Add/Remove Events
- dynamically triggered and managed by game engine
  - > JS is designed to look at user-driven events like clicking and input.
- ~~trade-off between massively improved maintainability and slight increase of potential overload after sleep time.~~
- All these events need to be handled by the game module (ColonySim), buffering information for the view.