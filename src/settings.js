export class Settings {
    save(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            console.log(`Saved: ${key} = ${value}`);
        } catch (error) {
            console.error("Failed to save settings:", error);
        }
    }

    load(cpu) {
        try {
            if (localStorage.length === 0) return;

            // Load CPU settings
            cpu.speed = this.get("speed", cpu.speed);
            cpu.quirk = this.get("quirk", cpu.quirk);

            // Load Display settings
            cpu.display.scale = this.get("scale", cpu.display.scale);
            cpu.display.bgColor = this.get("bgColor", cpu.display.bgColor);
            cpu.display.color = this.get("color", cpu.display.color);

            // Load Sound settings
            cpu.speaker.volumeLevel = this.get("volume", cpu.speaker.volumeLevel);
            cpu.speaker.wave = this.get("wave", cpu.speaker.wave);

        } catch (error) {
            console.error("Failed to load settings:", error);
        }
    }

    get(key, defaultValue) {
        const value = localStorage.getItem(key);
        return value !== null ? JSON.parse(value) : defaultValue;
    }
}
