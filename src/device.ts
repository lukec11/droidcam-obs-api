// Imports
import { DeviceInfo, DeviceModel } from './interfaces'
import { fetchGetText, fetchPut } from './utils'
import { autoFocusModes, whiteBalanceModes } from './static'

export default class Device implements DeviceModel {
  public address: string | undefined
  public port: number
  public url: string

  constructor({ address, port }: DeviceModel) {
    this.address = address || process.env.ADDRESS
    this.port = port || Number(process.env.PORT) || 4747 // 4747 is the default port, as far as I know
    this.url = `http://${this.address}:${this.port}/v1`

    // Check that address isn't undefined
    if (!this.address) {
      throw new Error('Address not found!')
    }
  }

  /**
   * Getter function for url
   * @returns url
   */
  public getUrl(): string {
    return this.url
  }

  /**
   * Get /camera/info with a bunch of information about the camera itself.
   * @returns DeviceInfo payload
   */
  public async getInfo(): Promise<DeviceInfo> {
    try {
      const res: string = await fetchGetText(`${this.getUrl()}/camera/info`)
      return JSON.parse(res)
    } catch (err) {
      // Catch for malformed JSON from camera not on
      // NOTE: That's probably not gonna happen anymore because it got fixed in utils.ts, but I'll leave it in here anyway just in case.
      if (err instanceof SyntaxError) {
        throw new Error(
          'Malformed JSON response! Are you sure the camera is connected to OBS?'
        )
      }
      // If it's not a malformed JSON string, throw the error along because I'm lazy and don't want to deal with it here.
      throw err
      // This is an indentation like this
    }
  }

  /**
   * Get phone battery level
   * @returns Promise<number> | Battery level
   */
  public async getBatteryLevel(): Promise<number> {
    const res: string = await fetchGetText(
      `${this.getUrl()}/phone/battery_level`
    )
    return Number(res)
  }

  /**
   * Get phone name
   * @returns Promise<string> | Phone name
   */
  public async getName(): Promise<string> {
    return await fetchGetText(`${this.getUrl()}/phone/name`)
  }

  /**
   * Returns an array of cameras on the device
   * @return {Promise<string[]>} Camera Array
   */
  public async getCameraList(): Promise<string[]> {
    // Splits the returned list into an array by newline
    const res: string[] = (
      await fetchGetText(`${this.getUrl()}/camera/camera_list`)
    ).split('\n')
    // Iterate through array & removes empty values
    for (let i = 0; i < res.length; i++) {
      if (res[i] === '') {
        res.splice(i)
      }
    }
    // return final result
    return res
  }

  /**
   * Set camera on device, based on cameras in getCameraList method
   * @param camera Camera, referenced by name
   */
  public async setCamera(camera: string): Promise<boolean> {
    try {
      const cameras = await this.getCameraList()
      // Check if camera in cameras list
      const camIndex = cameras.indexOf(camera)
      if (camIndex !== -1) {
        return await fetchPut(`${this.getUrl()}/camera/active/${camIndex}`)
      } else {
        throw new Error("Can't find that camera!")
      }
    } catch (err) {
      console.error(err)
      return false
    }
  }

  /**
   * Enable/Disable LED flashlight on device
   * @param status - boolean status to enable/disable flash
   * @returns Promise<boolean> representing successful or unsuccessful completion
   */
  public async setFlash(status: boolean): Promise<boolean> {
    try {
      // Check if LED is available
      if (!(await this.getInfo()).led_available) {
        throw new Error('No LED!')
      }
      // Check current status of LED
      let currentStatus: boolean
      if ((await this.getInfo()).led_enabled) {
        currentStatus = true
      } else {
        currentStatus = false
      }

      // If LED already in the correct position, do nothing.
      if (currentStatus === status) {
        return true
      } else {
        return await fetchPut(`${this.getUrl()}/camera/torch_toggle`)
      }
    } catch (err) {
      console.error(err)
      return false
    }
  }

  /**
   * Set the zoom level of the device
   * @param level Zoom level between 0 and getInfo().maxZoom
   * @returns boolean value representing successful completion
   */
  public async setZoom(level: number): Promise<boolean> {
    try {
      // check that we're not going above the maximum zoom level
      const maxZoom: number = (await this.getInfo()).maxZoom
      if (level > maxZoom) {
        throw new Error(`Zoom level above maximum of ${maxZoom}!`)
      }
      return await fetchPut(
        `${this.getUrl()}/camera/zoom_level/${String(level)}`
      )
    } catch (err) {
      console.error(err)
      return false
    }
  }

  /**
   * Set the exposure value of the device
   * @param level between 0 and getInfo().maxExposure
   * @returns boolean value representing successful completion
   */
  public async setExposureValue(level: number): Promise<boolean> {
    try {
      // check that we're not going above the maximum zoom level
      const maxExposure: number = (await this.getInfo()).maxExposure
      if (level > maxExposure) {
        throw new Error(`EV above maximum of ${maxExposure}!`)
      }
      return await fetchPut(`${this.getUrl()}/camera/ev_level/${String(level)}`)
    } catch (err) {
      console.error(err)
      return false
    }
  }

  /**
   * Set the white balance of the device
   * @param mode - One of the included White Balance Modes, as a string
   */
  public async setWhiteBalance(mode: string): Promise<boolean> {
    try {
      // basic check for invalid mode
      if (!whiteBalanceModes.hasOwnProperty(mode)) {
        throw new Error('Not a valid White balance mode!')
      }
      const modeNumber: number = whiteBalanceModes[mode]
      return await fetchPut(`${this.getUrl()}/camera/wb_mode/${modeNumber}`)
    } catch (err) {
      console.error(err)
      return false
    }
  }

  /**
   * Enable/Disable exposure lock
   * @param {boolean} status EL on/off
   * @return {Promise<boolean>} Successful completion
   */
  public async setExposureLock(status: boolean): Promise<boolean> {
    try {
      // Check current status of EL
      let currentStatus: boolean
      if ((await this.getInfo()).exposure_lock) {
        currentStatus = true
      } else {
        currentStatus = false
      }

      // If EL already in the correct position, do nothing.
      if (currentStatus === status) {
        // Return true, the exposure lock is already correct.
        return true
      } else {
        /*
         * On = 1, Off = 0
         * We know we want to set it to the opposite of what it is now
         * If currentStatus is true (currently on) then we want it to switch to 0 (off)
         * If currentStatus is false (currently off) we want it to switch to 1 (on)
         */
        const result = currentStatus ? '0' : '1'
        return await fetchPut(`${this.getUrl()}/camera/exposure_lock/${result}`)
      }
    } catch (err) {
      console.error(err)
      return false
    }
  }

  /**
   * Set the Auto Focus status of the device
   * @param mode - One of the included Autofocus Modes, as a string
   */
  public async setAutoFocus(mode: string): Promise<boolean> {
    try {
      // basic check for invalid mode
      if (!autoFocusModes.hasOwnProperty(mode)) {
        throw new Error('Not a valid autofocus mode!')
      }
      const modeNumber: number = autoFocusModes[mode]
      return await fetchPut(
        `${this.getUrl()}/camera/autofocus_mode/${modeNumber}`
      )
    } catch (err) {
      console.error(err)
      return false
    }
  }
  // TODO: Sound??
}
