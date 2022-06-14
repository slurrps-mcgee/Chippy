export class Helpers {
    constructor() {

    }

    //
    toJson(chip) {
        return JSON.stringify(chip);
    }

    fromJson(chip) {
        const loadedChip = JSON.parse(chip);
        
    }
}