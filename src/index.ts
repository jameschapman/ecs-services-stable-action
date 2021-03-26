import * as core from '@actions/core'
import {wait} from './wait'
import {Aws, Options} from 'aws-cli-js'

async function run(): Promise<void> {
  try {
    const attempts: number = parseInt(core.getInput('attempts'), 10)
    const cluster: string = core.getInput('cluster')
    const service: string = core.getInput('service')
    const accessKey: string = core.getInput('accesskey')
    const secretKey: string = core.getInput('secretKey')

    const options = new Options(accessKey, secretKey)
    options.cliPath = 'aws'
    const aws = new Aws(options)

    let count = 0

    core.info(
      `Checking if service ${service} is stable in cluster ${cluster}. Will try ${attempts} attempts.`
    )

    while (count <= attempts) {
      const data = await aws.command(
        `ecs describe-services --cluster ${cluster} --services ${service}`
      )

      const deployments: number = data.object.services[0].deployments.length
      const desiredCount: number = data.object.services[0].desiredCount
      const runningCount: number = data.object.services[0].runningCount
      core.info(`Attempt: ${count}`)
      core.info(`Deployments: ${deployments}`)
      core.info(`Desired Count: ${desiredCount}`)
      core.info(`Running Count: ${runningCount}`)

      if (deployments === 1 && runningCount === desiredCount) {
        core.info(`Service is stable`)
        return
      } else {
        core.info('waiting 15 seconds')
        count++
        if (count <= attempts) {
          await wait(15000)
        }
      }
    }
    core.setFailed('Failed to wait for service stability')
  } catch (error) {
    core.setFailed(error)
  }
}

run()
