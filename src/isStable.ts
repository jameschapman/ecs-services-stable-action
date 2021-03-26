import * as core from '@actions/core'
import {Aws, Options} from 'aws-cli-js'

export async function isStable(
  accessKey: string,
  secretKey: string,
  cluster: string,
  service: string
): Promise<boolean> {
  const options = new Options(accessKey, secretKey)
  const aws = new Aws(options)

  const data = await aws.command(
    `aws ecs describe-services --cluster ${cluster} --services "${service}"`
  )

  const deployments: number = data.object.deployments
  const desiredCount: number = data.object.desiredCount
  const runningCount: number = data.object.runningCount
  core.info(`Deployments: ${deployments}`)
  core.info(`Desired Count: ${desiredCount}`)
  core.info(`Running Count: ${runningCount}`)

  return deployments === 1 && runningCount === desiredCount
}
