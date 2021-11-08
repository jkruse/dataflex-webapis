import BroadcastChannel from './broadcast-channel';
import ContactPicker from './contact-picker';
import EyeDropper from './eye-dropper';
import Fullscreen from './fullscreen';
import PageVisibility from './page-visibility';
import ScreenWakeLock from './screen-wake-lock';
import Vibration from './vibration';

global.WebAPIs = {
    BroadcastChannel,
    ContactPicker,
    EyeDropper,
    Fullscreen,
    PageVisibility,
    ScreenWakeLock,
    Vibration
};
