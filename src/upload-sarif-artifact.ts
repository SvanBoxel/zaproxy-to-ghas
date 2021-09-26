import * as artifact from '@actions/artifact'

async function uploadSarifArtifact(filename: string): Promise<void> {
  const artifactClient = artifact.create()
  const artifactName = 'ZAProxy-sarif-report'
  const files = [filename]

  const rootDirectory = '.' // Also possible to use __dirname
  const options = {continueOnError: false}

  await artifactClient.uploadArtifact(
    artifactName,
    files,
    rootDirectory,
    options
  )
  return
}

export default uploadSarifArtifact
