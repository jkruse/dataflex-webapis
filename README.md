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

### Option 1

Download either just the prebuilt custom components (WebAPIsComponents.zip) or the entire demo workspace with prebuilt components (WebAPIsDemo.zip) from the [Releases](https://github.com/jkruse/dataflex-webapis/releases) page.

### Option 2

Download or clone the source code from GitHub, install NodeJS, and build the components with

    > npm ci
    > npm run build

## Usage

Copy `AppHtml/Custom` and the `AppSrc/*API.pkg` files to your workspace. If you don't have the `AppHtml/Custom` folder, see "How to get it" above.

Include these two lines in your `index.html` (if your application only runs on fairly modern browsers, you can probably omit the first one):

    <script src="https://unpkg.com/core-js-bundle/minified.js"></script>
    <script src="Custom/index.js"></script>

**NOTE that some of these APIs require a [secure context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts), which basically means they only work when page is accessed using https, or from localhost!** Those APIs are marked with a padlock icon in the demo application.

### About the core-js script include

I use recent ECMAScript features in the JavaScript source code for these custom components. When running on a major up-to-date evergreen browser (like Google Chrome, Microsoft Edge or Mozilla Firefox) these features work "out of the box". So if you're sure your application only runs on browsers like that, you can use these components without the core-js script include.

If you're not sure, or you explicitly support older browsers, including core-js will [polyfill](https://developer.mozilla.org/en-US/docs/Glossary/Polyfill) any missing features that *can* be polyfilled. YMMV but this could allow you to use components that would otherwise fail. Including it only adds a ~100 KB download to your page, and does not replace features that are natively supported.

If you *do* use core-js, please [support that project](https://github.com/zloirock/core-js/blob/master/docs/2023-02-14-so-whats-next.md)!

Including core-js will **not** implement API's that are not natively supported in a given browser. Always check the API pages linked above for browser support, and always check the `pbIsSupported` web property of each component at runtime before using it.
