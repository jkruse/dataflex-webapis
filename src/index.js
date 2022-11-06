import BroadcastChannel from './broadcast-channel';
import Clipboard from './clipboard';
import ContactPicker from './contact-picker';
import CredentialManagement from './credential-management';
import EyeDropper from './eye-dropper';
import Fullscreen from './fullscreen';
import NetworkInformation from './network-information';
import Notifications from './notifications';
import PageVisibility from './page-visibility';
import ScreenWakeLock from './screen-wake-lock';
import { AbsoluteOrientationSensor, AccelerometerSensor, AmbientLightSensor, GravitySensor, GyroscopeSensor, LinearAccelerationSensor, MagnetometerSensor } from './sensor';
import Vibration from './vibration';
import WebShare from './web-share';

global.WebAPIs = {
    AbsoluteOrientationSensor,
    AccelerometerSensor,
    AmbientLightSensor,
    BroadcastChannel,
    Clipboard,
    ContactPicker,
    CredentialManagement,
    EyeDropper,
    Fullscreen,
    GravitySensor,
    GyroscopeSensor,
    LinearAccelerationSensor,
    MagnetometerSensor,
    NetworkInformation,
    Notifications,
    PageVisibility,
    ScreenWakeLock,
    Vibration,
    WebShare
};
