# dataflex-webapis

DataFlex Custom Components for Web APIs.

Contains DataFlex implementations of:

* [Battery Status API](https://developer.mozilla.org/en-US/docs/Web/API/Battery_Status_API)
* [Broadcast Channel API](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API)
* [Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API)
* [Contact Picker API](https://developer.mozilla.org/en-US/docs/Web/API/Contact_Picker_API)
* [Credential Management API](https://developer.mozilla.org/en-US/docs/Web/API/Credential_Management_API)
* [EyeDropper API](https://developer.mozilla.org/en-US/docs/Web/API/EyeDropper_API)
* [Fullscreen API](https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API)
* [MediaStream Image Capture API](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Image_Capture_API)
* [MediaStream Recording API](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API)
* [Network Information API](https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API)
* [Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
* [Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)
* [Screen Wake Lock API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API)
* [Sensor APIs](https://developer.mozilla.org/en-US/docs/Web/API/Sensor_APIs)
* [Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API)
* [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API)
* [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)

## How to get it

### Option 1: DataFlex Package Manager (recommended)

Requires a DataFlex 26 installation (which includes the `df-cli` package manager):

    > df-cli package install <your-workspace>.sws Kruse-Net/WebAPIs

This adds the custom components to your workspace, copies the client-side JavaScript to your `AppHtml/WebAPIs` folder, and injects the required script includes into your `Index.html` automatically.

### Option 2: GitHub Releases

Download either the package (`WebAPIs-<version>.zip`) or the entire demo workspace with prebuilt components (`WebAPIsDemo.zip`) from the [Releases](https://github.com/jkruse/dataflex-webapis/releases) page.
The demo workspace is self-contained: extract the zip and open `Demo/WebAPIs Demo.sws`.

### Option 3: Build from source

Clone the source code from GitHub, install NodeJS, and build the client-side JavaScript with

    > npm ci
    > npm run build

The built bundle is created in `AppHtml/WebAPIs`. The component classes are the `AppSrc/*API.pkg` files.

## Usage

If you use the package manager, the components are available in your workspace and the script includes are injected automatically.
Otherwise, copy `AppHtml/WebAPIs` and the `AppSrc/*API.pkg` files to your workspace, and include this line in your `Index.html`:

    <script src="WebAPIs/index.js"></script>

**NOTE that some of these APIs require a [secure context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts), which basically means they only work when page is accessed using https, or from localhost!**
Those APIs are marked with a padlock icon in the demo application.
