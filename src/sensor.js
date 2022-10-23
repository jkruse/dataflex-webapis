import { queryPermission } from "./utils/permissions";

class Sensor extends df.WebObject {
    sensor;

    constructor(sName, oParent) {
        super(sName, oParent);
        this.prop(df.tBool, 'pbIsSupported', false);
        this.event('OnActivate');
        this.event('OnReading');
        this.event('OnError');
    }

    start() {
        this.sensor?.start();
    }

    stop() {
        this.sensor?.stop();
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
        this.prop(df.tString, 'psAccelerometerPermission', '');
        this.prop(df.tString, 'psMagnetometerPermission', '');
        this.prop(df.tString, 'psGyroscopePermission', '');
        this.event('OnAccelerometerPermissionChange');
        this.event('OnMagnetometerPermissionChange');
        this.event('OnGyroscopePermissionChange');
    }

    create(tDef) {
        super.create(tDef);
        this.set('pbIsSupported', 'AbsoluteOrientationSensor' in window);
        if (this.pbIsSupported) {
            try {
                this.sensor = new window.AbsoluteOrientationSensor({ frequency: this.pnFrequency, referenceFrame: this.psReferenceFrame });
                this.sensor.addEventListener('activate', () => this.fire('OnActivate'));
                this.sensor.addEventListener('reading', () => this.fire('OnReading', this.sensor.quaternion));
                this.sensor.addEventListener('error', event => this.fire('OnError', [event.error.name, event.error.message]));
            }
            catch (error) {
                this.fire('OnError', [error.name, error.message]);
            }
        }
    }

    start() {
        Promise.all([
            queryPermission(this, 'accelerometer', 'psAccelerometerPermission', 'OnAccelerometerPermissionChange'),
            queryPermission(this, 'magnetometer', 'psMagnetometerPermission', 'OnMagnetometerPermissionChange'),
            queryPermission(this, 'gyroscope', 'psGyroscopePermission', 'OnGyroscopePermissionChange')
        ]).then(results => {
            if (results.every(result => result === 'granted')) {
                super.start();
            }
            else {
                this.fire('OnError', ['SensorPermissionError', 'No permission to use AbsoluteOrientationSensor']);
            }
        });
    }
}
