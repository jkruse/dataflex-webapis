import BroadcastChannel from './broadcast-channel';
import Clipboard from './clipboard';
import ContactPicker from './contact-picker';
import CredentialManagement from './credential-management';
import EyeDropper from './eye-dropper';
import Fullscreen from './fullscreen';
import NetworkInformation from './network-information';
import Notifications from './notifications';
import PageVisibility from './page-visibility';
import ScreenOrientation from './screen-orientation';
import ScreenWakeLock from './screen-wake-lock';
import {
    AbsoluteOrientationSensor,
    AccelerometerSensor,
    AmbientLightSensor,
    GravitySensor,
    GyroscopeSensor,
    LinearAccelerationSensor,
    MagnetometerSensor,
    RelativeOrientationSensor
} from './sensor';
import Vibration from './vibration';
import WebShare from './web-share';
import { LocalStorage, SessionStorage } from './web-storage';

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
    LocalStorage,
    MagnetometerSensor,
    NetworkInformation,
    Notifications,
    PageVisibility,
    RelativeOrientationSensor,
    ScreenOrientation,
    ScreenWakeLock,
    SessionStorage,
    Vibration,
    WebShare
};
