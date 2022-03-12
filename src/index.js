import BarcodeDetection from './barcode-detection';
import BroadcastChannel from './broadcast-channel';
import ContactPicker from './contact-picker';
import EyeDropper from './eye-dropper';
import Fullscreen from './fullscreen';
import Notifications from './notifications';
import PageVisibility from './page-visibility';
import ScreenWakeLock from './screen-wake-lock';
import Vibration from './vibration';

global.WebAPIs = {
    BarcodeDetection,
    BroadcastChannel,
    ContactPicker,
    EyeDropper,
    Fullscreen,
    Notifications,
    PageVisibility,
    ScreenWakeLock,
    Vibration
};
