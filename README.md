# dataflex-webapis

DataFlex Custom Components for Web APIs.

Contains DataFlex implementations of:

* [Broadcast Channel API](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API)
* [Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API)
* [Contact Picker API](https://developer.mozilla.org/en-US/docs/Web/API/Contact_Picker_API)
* [Credential Management API](https://developer.mozilla.org/en-US/docs/Web/API/Credential_Management_API)
* [EyeDropper API](https://developer.mozilla.org/en-US/docs/Web/API/EyeDropper_API)
* [Fullscreen API](https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API)
* [Network Information API](https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API)
* [Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
* [Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)
* [Screen Wake Lock API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API)
* [Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API)
* [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API)

## How to get it

### Option 1

Download either just the prebuilt custom components (WebAPIsComponents.zip) or the entire demo workspace with prebuilt components (WebAPIsDemo.zip) from the [Releases](https://github.com/jkruse/dataflex-webapis/releases) page.

### Option 2

Download or clone the source code from GitHub, install NodeJS, and build the components with

    > npm ci
    > npm run build

## Usage

Copy `AppHtml/Custom` and the `AppSrc/*API.pkg` files to your workspace. If you don't have the `AppHtml/Custom` folder, see "How to get it" above.

Include these two lines in your `index.html`:

    <script src="https://unpkg.com/core-js-bundle@3.8.3/minified.js"></script>
    <script src="Custom/index.js"></script>

**NOTE that some of these APIs require a secure context, which means they only work when page is accessed using https!** Those APIs are marked with a padlock icon in the demo application.