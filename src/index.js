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
import Vibration from './vibration';
import WebShare from './web-share';

global.WebAPIs = {
    BroadcastChannel,
    Clipboard,
    ContactPicker,
    CredentialManagement,
    EyeDropper,
    Fullscreen,
    NetworkInformation,
    Notifications,
    PageVisibility,
    ScreenWakeLock,
    Vibration,
    WebShare
};
