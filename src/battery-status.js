export default class BatteryStatus extends df.WebObject {
    #battery;

    constructor(sName, oParent) {
        super(sName, oParent);
        this.prop(df.tBool, 'pbIsSupported', false);
        this.event('OnChargingChange');
        this.event('OnLevelChange');
        this.event('OnChargingTimeChange');
        this.event('OnDischargingTimeChange');
    }

    async create(tDef) {
        super.create(tDef);
        this.set('pbIsSupported', 'getBattery' in navigator);
        if (this.pbIsSupported) {
            this.#battery = await navigator.getBattery();

            this.#battery.addEventListener('chargingchange', () => {
                this.#updateChargeInfo();
            });
            this.#updateChargeInfo();

            this.#battery.addEventListener('levelchange', () => {
                this.#updateLevelInfo();
            });
            this.#updateLevelInfo();

            this.#battery.addEventListener('chargingtimechange', () => {
                this.#updateChargingInfo();
            });
            this.#updateChargingInfo();

            this.#battery.addEventListener('dischargingtimechange', () => {
                this.#updateDischargingInfo();
            });
            this.#updateDischargingInfo();
        }
    }

    #updateChargeInfo() {
        this.fire('OnChargingChange', [df.fromBool(this.#battery.charging)]);
    }

    #updateLevelInfo() {
        this.fire('OnLevelChange', [this.#battery.level]);
    }

    #updateChargingInfo() {
        this.fire('OnChargingTimeChange', [this.#battery.chargingTime === Infinity ? -1 : this.#battery.chargingTime]);
    }

    #updateDischargingInfo() {
        this.fire('OnDischargingTimeChange', [this.#battery.dischargingTime === Infinity ? -1 : this.#battery.dischargingTime]);
    }

    set_pbServerOnChargingChange(val) {
        if (val) {
            setTimeout(() => this.#updateChargeInfo());
        }
    }

    set_pbServerOnLevelChange(val) {
        if (val) {
            setTimeout(() => this.#updateLevelInfo());
        }
    }

    set_pbServerOnChargingTimeChange(val) {
        if (val) {
            setTimeout(() => this.#updateChargingInfo());
        }
    }

    set_pbServerOnDischargingTimeChange(val) {
        if (val) {
            setTimeout(() => this.#updateDischargingInfo());
        }
    }
}
