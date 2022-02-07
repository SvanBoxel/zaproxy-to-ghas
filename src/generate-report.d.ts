// export as namespace reportTypes

export interface zapObjectAlertInstance {
  uri: string
  kind: string
  method: string
  fullyQualifiedName: string
  evidence: string
}

export interface zapObjectAlert {
  name: string
  desc: string
  riskdesc: string
  alertRef: number
  cweid: string
  instances: zapObjectAlertInstance[]
}

export interface zapObjectSite {
  alerts: zapObjectAlert[]
}

export interface zapObject {
  site: zapObjectSite[]
}

export interface rule {
  id: string
  shortDescription: {
    text: string
  }
  fullDescription: {
    text: string
  }
  helpUri: string
  defaultConfiguration: {
    level: string
  }
}

export interface resultLocation {
  physicalLocation: {
    artifactLocation: {
      uri: string
    }
    region: {
      startLine: number
    }
  }
  logicalLocations: {
    name: string
    kind: string
    fullyQualifiedName: string
  }[]
}

export interface result {
  ruleId: string
  message: {
    text: string
  }
  locations: resultLocation[]
}

export interface report {
  $schema: string
  version: string
  runs: {
    tool: {
      driver: {
        name: string
        informationUri: string
        rules: rule[]
      }
    }
    results: result[]
  }[]
}
