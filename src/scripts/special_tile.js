
/**
 * The purpose of this class is to help with dynamic collision. The idea is that 
 * when a character moves, we can quickly check what kind of tile the character is 
 * going to move into using game.floor.floorTiles and the character's future position. 
 * If the tile is an instanceof SpecialTile, we can check its type (wall or pit) and 
 * take the appropriate action.
 */
class SpecialTile {
    constructor(params) {
        this.position = params["position"];
        this.type = params["type"];
    }
}


module.exports = SpecialTile;
