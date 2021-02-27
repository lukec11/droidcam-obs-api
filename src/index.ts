// Only run this in dev mode
if (process.env.NODE_ENV === 'development') {
  // Pull from .env file
  require('dotenv').config()

  // I'm disabling this because typescript doesn't have a way to do scoped imports and it's dumb
  // There is probably a proper solution, but I am incredibly lazy
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const chalk = require('chalk')
  console.warn(
    chalk.magenta(
      'This is a DEVELOPMENT environment! Do not use in production.'
    )
  )
}
/* These are all examples of what you can do! Please modify to change functionality :) */

import Device from './device'

const phone = new Device({
    address: '192.168.1.44',
    port: 1212
  })

  // This is just an example! Modify to your heart's content.
;(async (): Promise<void> => {
  console.log(
    `Hello! My name is ${await phone.getName()} and I'm currently at ${await phone.getBatteryLevel()}% battery.`
  )
})()
