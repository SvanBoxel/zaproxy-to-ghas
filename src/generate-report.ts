import fs from 'fs'
import * as reportTypes from './generate-report.d'

const report_filename = 'results.sarif'
const result_seperator = '<br/><br/> ------- <br/><br/>'

const parse = (object: reportTypes.zapObject): reportTypes.report => {
  const rules = object.site.reduce(
    (acc: reportTypes.rule[], cur: reportTypes.zapObjectSite) => {
      const alerts = cur.alerts.map((alert: reportTypes.zapObjectAlert) => {
        let severity = 'warning'
        if (alert.riskdesc.includes('High ')) severity = 'error'
        if (alert.riskdesc.includes('Medium ')) severity = 'warning'
        if (alert.riskdesc.includes('Informational ')) severity = 'note'

        return {
          id: alert.alertRef.toString(),
          shortDescription: {text: alert.name},
          fullDescription: {
            text: alert.desc.replace(/<p>/g, '').replace(/<\/p>/g, '')
          },
          helpUri: `https://www.zaproxy.org/docs/alerts/${alert.alertRef}`,
          defaultConfiguration: {level: severity},
          properties: {
            tags: [`external/cwe/cwe-${alert.cweid}`]
          }
        }
      })
      for (const [index] of alerts.entries()) {
        if (!acc.some(r => r.id.toString() === alerts[index].id.toString())) {
          acc.push(alerts[index])
        }
      }
      return acc
    },
    []
  )

  const results = object.site.reduce((acc: reportTypes.result[], site) => {
    // eslint-disable-next-line github/array-foreach
    site.alerts.forEach(cur => {
      const alert = {
        ruleId: cur.alertRef.toString(),
        message: {
          text: `<strong>${cur.name}</strong> <br/><br/>
                ${
                  cur.instances &&
                  cur.instances
                    .map(instance => {
                      return Object.keys(instance)
                        .map(
                          (key: string) =>
                            `${key}: ${instance[key as keyof typeof instance]
                              .replace(/</g, '&lt;')
                              .replace(/>/g, '&gt;')}`
                        )
                        .join('<br/>')
                    })
                    .join(result_seperator)
                }
                `
        },
        locations:
          cur.instances &&
          cur.instances.map(instance => {
            return {
              physicalLocation: {
                artifactLocation: {
                  uri: instance.uri
                    .replace(/(^\w+:|^)\/\//, '')
                    .replace(/\/$/, '')
                    .replace(/:\d+/, '')
                },
                region: {
                  startLine: 1
                }
              },
              logicalLocations: [
                {
                  name: instance.uri,
                  kind: instance.method,
                  fullyQualifiedName: instance.evidence
                }
              ]
            }
          })
      }
      acc.push(alert)
    })
    return acc
  }, [])

  return {
    $schema:
      'https://json.schemastore.org/sarif-2.1.0.json',
    version: '2.1.0',
    runs: [
      {
        tool: {
          driver: {
            name: 'ZAProxy',
            informationUri: 'https://www.zaproxy.org/',
            rules
          }
        },
        results
      }
    ]
  }
}

function generateReport(): string {
  const data = fs.readFileSync('./report_json.json', {
    encoding: 'utf8',
    flag: 'r'
  })
  const result = parse(JSON.parse(data))
  fs.writeFileSync(report_filename, JSON.stringify(result))
  return report_filename
}

export default generateReport
