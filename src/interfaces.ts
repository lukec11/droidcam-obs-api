/* Example of a device */
export interface DeviceModel {
  address?: string | undefined;
  port?: number;
}

/* Interface describing the response from the Device.getInfo() call */
export interface DeviceInfo {
  active: number;
  focusMode: number;
  maxZoom: number;
  currZoom: number;
  currExposure: number;
  maxExposure: number;
  wbMode: number;
  exposure_lock: number;
  led_available: boolean;
  led_enabled?: number; // not always available
  mute_sound: number;
}
