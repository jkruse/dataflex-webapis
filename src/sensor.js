import { queryPermission } from "./utils/permissions";

class Sensor extends df.WebObject {
    #sensorConstructor;
    #sensor;
    #permissions = [];

    constructor(sName, oParent, fSensorConstructor) {
        super(sName, oParent);
        this.#sensorConstructor = fSensorConstructor;
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

    createSensor(options) {
        this.stop();
        if (this.pbIsSupported) {
            try {
                this.sensor = new this.#sensorConstructor(options);
            }
            catch (error) {
                this.fire('OnError', [error.name, error.message]);
            }
        }
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

class FrequencySensor extends Sensor {
    constructor(sName, oParent, fSensorConstructor) {
        super(sName, oParent, fSensorConstructor);
        this.prop(df.tNumber, 'pnFrequency', 1);
    }

    set_pnFrequency(nFrequency) {
        this.createSensor({ frequency: nFrequency });
    }
}

class ReferenceFrameSensor extends FrequencySensor {
    constructor(sName, oParent, fSensorConstructor) {
        super(sName, oParent, fSensorConstructor);
        this.prop(df.tString, 'psReferenceFrame', 'device');
    }

    set_pnFrequency(nFrequency) {
        this.createSensor({ frequency: nFrequency, referenceFrame: this.psReferenceFrame });
    }

    set_psReferenceFrame(sReferenceFrame) {
        this.createSensor({ frequency: this.pnFrequency, referenceFrame: sReferenceFrame });
    }
}

export class AbsoluteOrientationSensor extends ReferenceFrameSensor {
    constructor(sName, oParent) {
        super(sName, oParent, window.AbsoluteOrientationSensor);
        this.configurePermission('accelerometer', 'psAccelerometerPermission', 'OnAccelerometerPermissionChange');
        this.configurePermission('magnetometer', 'psMagnetometerPermission', 'OnMagnetometerPermissionChange');
        this.configurePermission('gyroscope', 'psGyroscopePermission', 'OnGyroscopePermissionChange');
    }

    create(tDef) {
        super.create(tDef);
        this.set('pbIsSupported', 'AbsoluteOrientationSensor' in window);
        this.createSensor({ frequency: this.pnFrequency, referenceFrame: this.psReferenceFrame });
    }

    get reading() {
        return this.sensor.quaternion;
    }
}

export class AccelerometerSensor extends ReferenceFrameSensor {
    constructor(sName, oParent) {
        super(sName, oParent, Accelerometer);
        this.configurePermission('accelerometer', 'psAccelerometerPermission', 'OnAccelerometerPermissionChange');
    }

    create(tDef) {
        super.create(tDef);
        this.set('pbIsSupported', 'Accelerometer' in window);
        this.createSensor({ frequency: this.pnFrequency, referenceFrame: this.psReferenceFrame });
    }

    get reading() {
        return [this.sensor.x, this.sensor.y, this.sensor.z];
    }
}

export class AmbientLightSensor extends FrequencySensor {
    constructor(sName, oParent) {
        super(sName, oParent, window.AmbientLightSensor);
        this.configurePermission('ambient-light-sensor', 'psAmbientLightSensorPermission', 'OnAmbientLightSensorPermissionChange');
    }

    create(tDef) {
        super.create(tDef);
        this.set('pbIsSupported', 'AmbientLightSensor' in window);
        this.createSensor({ frequency: this.pnFrequency });
    }

    get reading() {
        return [this.sensor.illuminance];
    }
}

export class GravitySensor extends ReferenceFrameSensor {
    constructor(sName, oParent) {
        super(sName, oParent, window.GravitySensor);
        this.configurePermission('accelerometer', 'psAccelerometerPermission', 'OnAccelerometerPermissionChange');
    }

    create(tDef) {
        super.create(tDef);
        this.set('pbIsSupported', 'GravitySensor' in window);
        this.createSensor({ frequency: this.pnFrequency, referenceFrame: this.psReferenceFrame });
    }

    get reading() {
        return [this.sensor.x, this.sensor.y, this.sensor.z];
    }
}

export class GyroscopeSensor extends ReferenceFrameSensor {
    constructor(sName, oParent) {
        super(sName, oParent, Gyroscope);
        this.configurePermission('gyroscope', 'psGyroscopePermission', 'OnGyroscopePermissionChange');
    }

    create(tDef) {
        super.create(tDef);
        this.set('pbIsSupported', 'Gyroscope' in window);
        this.createSensor({ frequency: this.pnFrequency, referenceFrame: this.psReferenceFrame });
    }

    get reading() {
        return [this.sensor.x, this.sensor.y, this.sensor.z];
    }
}

export class LinearAccelerationSensor extends ReferenceFrameSensor {
    constructor(sName, oParent) {
        super(sName, oParent, window.LinearAccelerationSensor);
        this.configurePermission('accelerometer', 'psAccelerometerPermission', 'OnAccelerometerPermissionChange');
    }

    create(tDef) {
        super.create(tDef);
        this.set('pbIsSupported', 'LinearAccelerationSensor' in window);
        this.createSensor({ frequency: this.pnFrequency, referenceFrame: this.psReferenceFrame });
    }

    get reading() {
        return [this.sensor.x, this.sensor.y, this.sensor.z];
    }
}

export class MagnetometerSensor extends ReferenceFrameSensor {
    constructor(sName, oParent) {
        super(sName, oParent, Magnetometer);
        this.configurePermission('magnetometer', 'psMagnetometerPermission', 'OnMagnetometerPermissionChange');
    }

    create(tDef) {
        super.create(tDef);
        this.set('pbIsSupported', 'Magnetometer' in window);
        this.createSensor({ frequency: this.pnFrequency, referenceFrame: this.psReferenceFrame });
    }

    get reading() {
        return [this.sensor.x, this.sensor.y, this.sensor.z];
    }
}
