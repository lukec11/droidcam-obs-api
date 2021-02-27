_Shoutout to https://github.com/stemmlerjs/simple-typescript-starter for teaching me how to use this stuff and letting me steal + modify their config files :)_

---

I wrote this little app to make it easier to write JS/TS integrations to do stuff with [DroidCam OBS](https://www.dev47apps.com/obs/). DroidCam OBS comes with a little remote web interface, which is super cool - but web scraping is annoying. After a little reverse engineering and reading of API calls, this is what I came up with.

I can't guarantee this will be accurate or work well (not a great sales pitch, I know) - but it does what I need it to, and I figured I might as well release it.

---

## Building

Run `npm run build`, and your stuff ends up in the `build/` folder. Not much to this one :)

Building is all done with `tsc`, thus configuration is in `tsconfig.json`.

---

## Usage

You're going to want to import the module, obviously - In javascript, that's probably something along the lines of

```js
import { Device } from 'droidcam-obs-api'

// Initialize
const myPhone = new Device({
  address: 'droidcam-ip-address-here',
  port: 'droidcam-port-here'
})
```

Now, you can call functions to your heart's content! Note that they use node-fetch and are asynchronous, so you'll probably want to promisify or call them with `await`.

---

Oh yeah, watch out for the error handling...
