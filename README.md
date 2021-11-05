# dataflex-webapis

DataFlex Custom Components for Web APIs.

Contains DataFlex implementations of:

* [Contact Picker API](https://developer.mozilla.org/en-US/docs/Web/API/Contact_Picker_API)
* [EyeDropper API](https://developer.mozilla.org/en-US/docs/Web/API/EyeDropper_API)
* [Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API)

## How to get it

### Option 1

Download either just the prebuilt custom components (WebAPIsComponents.zip) or the entire demo workspace with prebuilt components (WebAPIsDemo.zip) from the [Releases](https://github.com/jkruse/dataflex-webapis/releases) page.

### Option 2

Download or clone the source code from GitHub, install NodeJS, and build the components with

    > npm run build

## Usage

Copy `AppHtml/Custom` and the `AppSrc/*API.pkg` files to your workspace. If you don't have the `AppHtml/Custom` folder, see "How to get it" above.

Include these two lines in your `index.html`:

    <script src="https://unpkg.com/core-js-bundle@3.8.3/minified.js"></script>
    <script src="Custom/index.js"></script>
