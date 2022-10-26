import { queryPermission } from "./utils/permissions";

class Sensor extends df.WebObject {
    #sensor;
    #permissions = [];

    constructor(sName, oParent) {
        super(sName, oParent);
        this.prop(df.tBool, 'pbIsSupported', false);
        this.event('OnActivate');
        this.event('OnReading');
        this.event('OnError');
    }

    get sensor() {
        return this.#sensor;
    }

    set sensor(val) {
        val.addEventListener('activate', () => this.fire('OnActivate'));
        val.addEventListener('reading', () => this.fire('OnReading', this.reading));
        val.addEventListener('error', event => this.fire('OnError', [event.error.name, event.error.message]));
        this.#sensor = val;
    }

    get reading() {
        return [];
    }

    configurePermission(permission, property, event) {
        this.prop(df.tString, property, '');
        this.event(event);
        this.#permissions.push([permission, property, event]);
    }

    async start() {
        const queries = this.#permissions.map(perm => queryPermission(this, ...perm));
        const results = await Promise.all(queries);
        if (results.every(result => result === 'granted')) {
            this.#sensor?.start();
        }
        else {
            this.fire('OnError', ['SensorPermissionError', 'No permission to use this sensor']);
        }
    }

    stop() {
        this.#sensor?.stop();
    }

    destroy() {
        this.stop();
        super.destroy();
    }
}

export class AbsoluteOrientationSensor extends Sensor {
    constructor(sName, oParent) {
        super(sName, oParent);
        this.prop(df.tNumber, 'pnFrequency', 1);
        this.prop(df.tString, 'psReferenceFrame', 'device');
        this.configurePermission('accelerometer', 'psAccelerometerPermission', 'OnAccelerometerPermissionChange');
        this.configurePermission('magnetometer', 'psMagnetometerPermission', 'OnMagnetometerPermissionChange');
        this.configurePermission('gyroscope', 'psGyroscopePermission', 'OnGyroscopePermissionChange');
    }

    create(tDef) {
        super.create(tDef);
        this.set('pbIsSupported', 'AbsoluteOrientationSensor' in window);
        this.#createSensor(this.pnFrequency, this.psReferenceFrame);
    }

    #createSensor(frequency, referenceFrame) {
        this.stop();
        if (this.pbIsSupported) {
            try {
                this.sensor = new window.AbsoluteOrientationSensor({ frequency, referenceFrame });
            }
            catch (error) {
                this.fire('OnError', [error.name, error.message]);
            }
        }
    }

    get reading() {
        return this.sensor.quaternion;
    }

    set_pnFrequency(nFrequency) {
        this.#createSensor(nFrequency, this.psReferenceFrame);
    }

    set_psReferenceFrame(sReferenceFrame) {
        this.#createSensor(this.pnFrequency, sReferenceFrame);
    }
}

export class AccelerometerSensor extends Sensor {
    constructor(sName, oParent) {
        super(sName, oParent);
        this.prop(df.tNumber, 'pnFrequency', 1);
        this.prop(df.tString, 'psReferenceFrame', 'device');
        this.configurePermission('accelerometer', 'psAccelerometerPermission', 'OnAccelerometerPermissionChange');
    }

    create(tDef) {
        super.create(tDef);
        this.set('pbIsSupported', 'Accelerometer' in window);
        this.#createSensor(this.pnFrequency, this.psReferenceFrame);
    }

    #createSensor(frequency, referenceFrame) {
        this.stop();
        if (this.pbIsSupported) {
            try {
                this.sensor = new Accelerometer({ frequency, referenceFrame });
            }
            catch (error) {
                this.fire('OnError', [error.name, error.message]);
            }
        }
    }

    get reading() {
        return [this.sensor.x, this.sensor.y, this.sensor.z];
    }

    set_pnFrequency(nFrequency) {
        this.#createSensor(nFrequency, this.psReferenceFrame);
    }

    set_psReferenceFrame(sReferenceFrame) {
        this.#createSensor(this.pnFrequency, sReferenceFrame);
    }
}

export class AmbientLightSensor extends Sensor {
    constructor(sName, oParent) {
        super(sName, oParent);
        this.prop(df.tNumber, 'pnFrequency', 1);
        this.configurePermission('ambient-light-sensor', 'psAmbientLightSensorPermission', 'OnAmbientLightSensorPermissionChange');
    }

    create(tDef) {
        super.create(tDef);
        this.set('pbIsSupported', 'AmbientLightSensor' in window);
        this.#createSensor(this.pnFrequency);
    }

    #createSensor(frequency) {
        this.stop();
        if (this.pbIsSupported) {
            try {
                this.sensor = new window.AmbientLightSensor({ frequency });
            }
            catch (error) {
                this.fire('OnError', [error.name, error.message]);
            }
        }
    }

    get reading() {
        return [this.sensor.illuminance];
    }

    set_pnFrequency(nFrequency) {
        this.#createSensor(nFrequency);
    }
}

export class GravitySensor extends Sensor {
    constructor(sName, oParent) {
        super(sName, oParent);
        this.prop(df.tNumber, 'pnFrequency', 1);
        this.prop(df.tString, 'psReferenceFrame', 'device');
        this.configurePermission('accelerometer', 'psAccelerometerPermission', 'OnAccelerometerPermissionChange');
    }

    create(tDef) {
        super.create(tDef);
        this.set('pbIsSupported', 'GravitySensor' in window);
        this.#createSensor(this.pnFrequency, this.psReferenceFrame);
    }

    #createSensor(frequency, referenceFrame) {
        this.stop();
        if (this.pbIsSupported) {
            try {
                this.sensor = new window.GravitySensor({ frequency, referenceFrame });
            }
            catch (error) {
                this.fire('OnError', [error.name, error.message]);
            }
        }
    }

    get reading() {
        return [this.sensor.x, this.sensor.y, this.sensor.z];
    }

    set_pnFrequency(nFrequency) {
        this.#createSensor(nFrequency, this.psReferenceFrame);
    }

    set_psReferenceFrame(sReferenceFrame) {
        this.#createSensor(this.pnFrequency, sReferenceFrame);
    }
}

export class GyroscopeSensor extends Sensor {
    constructor(sName, oParent) {
        super(sName, oParent);
        this.prop(df.tNumber, 'pnFrequency', 1);
        this.prop(df.tString, 'psReferenceFrame', 'device');
        this.configurePermission('gyroscope', 'psGyroscopePermission', 'OnGyroscopePermissionChange');
    }

    create(tDef) {
        super.create(tDef);
        this.set('pbIsSupported', 'Gyroscope' in window);
        this.#createSensor(this.pnFrequency, this.psReferenceFrame);
    }

    #createSensor(frequency, referenceFrame) {
        this.stop();
        if (this.pbIsSupported) {
            try {
                this.sensor = new Gyroscope({ frequency, referenceFrame });
            }
            catch (error) {
                this.fire('OnError', [error.name, error.message]);
            }
        }
    }

    get reading() {
        return [this.sensor.x, this.sensor.y, this.sensor.z];
    }

    set_pnFrequency(nFrequency) {
        this.#createSensor(nFrequency, this.psReferenceFrame);
    }

    set_psReferenceFrame(sReferenceFrame) {
        this.#createSensor(this.pnFrequency, sReferenceFrame);
    }
}
