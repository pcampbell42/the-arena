
class PolyTreeNode {
    constructor(params) {
        this.indices = params["indices"];
        this.parent = undefined;
        this.children = [];
    }
}

module.exports = PolyTreeNode;
