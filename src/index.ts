import * as core from '@actions/core'
import {wait} from './wait'
import {isStable} from './isStable'

async function run(): Promise<void> {
  try {
    const attempts: number = parseInt(core.getInput('attempts'), 10)
    const cluster: string = core.getInput('cluster')
    const service: string = core.getInput('service')
    const accessKey: string = core.getInput('accesskey')
    const secretKey: string = core.getInput('secretKey')

    let count = 0

    core.info(`Checking if service ${service} is stable in cluster ${cluster}`)

    while (count <= attempts) {
      if (isStable(accessKey, secretKey, cluster, service)) {
        core.info(`Service is stable`)
        return
      } else {
        await wait(1500)
        count++
      }
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
