import fetch, { Response } from 'node-fetch'

/**
 * Sends a GET request to a given URL
 * @param url URL to GET
 * @returns Response text
 */
export async function fetchGetText(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      method: 'GET'
    })

    if (!res.ok) {
      // Response isn't a 200 (Most likely a 503)
      throw new Error(`Request failed: ${res.status}`)
    }

    return await res.text()
  } catch (err) {
    throw new Error(`Can't connect to camera! Check address / port. \n${err}`)
  }
}

/**
 * Sends a PUT request to a given URL
 * @param url URl to PUT
 * @returns Boolean indicating whether or not the response was 'ok' (2xx)
 */
export async function fetchPut(url: string): Promise<boolean> {
  try {
    const res: Response = await fetch(url, {
      method: 'PUT'
    })

    return res.ok
  } catch (err) {
    throw new Error("Can't connect to camera! Check address / port.")
  }
}
