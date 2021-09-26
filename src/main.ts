import uploadSarifArtifact from './upload-sarif-artifact'
import generateReport from './generate-report'

async function run(): Promise<void> {
  const file_name = generateReport()
  return await uploadSarifArtifact(file_name)
}

run()
