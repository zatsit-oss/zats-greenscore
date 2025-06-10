const step1 = {
  section: 'architecture',
  title: '🏗 Architecture',
  rules: [
    {
      title:
        'Use Event Driven Architecture to avoid polling madness and inform subscribers of an update',
      ruleId: 'AR01',
      id: 1,
      description: 'Use Event Driven Architecture to avoid polling madness.',
      type: 'toggle',
      point: 375
    },
    {
      point: 375,
      description: 'Deploy the API near the consumer',
      title: 'API runtime close to the Consumer',
      type: 'toggle',
      ruleId: 'AR02',
      id: 2
    },
    {
      description: 'Ensure only one API fit the same need',
      title: 'Ensure the same API does not exist',
      point: 375,
      type: 'toggle',
      ruleId: 'AR03',
      id: 3
    },
    {
      description: 'Use scalable infrastructure to avoid over-provisioning',
      ruleId: 'AR04',
      type: 'toggle',
      point: 375,
      title: 'Use scalable infrastructure to avoid over-provisioning',
      id: 4
    }
  ],
  id: 1
}
const step2 = {
  section: 'design',
  id: 2,
  title: '👨‍🎨 Design',
  rules: [
    {
      ruleId: 'DE01',
      type: 'toggle',
      id: 1,
      title: 'Choose an exchange format with the smallest size (JSON is smallest than XML)',
      point: 600,
      description: 'Prefer an exchange format with the smallest size (JSON is smaller than XML).'
    },
    {
      ruleId: 'DE02',
      type: 'toggle',
      title: 'New API --> cache usage',
      point: 360,
      description: 'Use cache to avoid useless requests and preserve compute resources.',
      id: 2
    },
    {
      point: 480,
      type: 'toggle',
      description: 'Use the cache efficiently to avoid useless resources consumtion.',
      ruleId: 'DE03',
      title: 'Existing API --> cache usage efficiency',
      id: 3
    },
    {
      title: 'Opaque token usage',
      type: 'toggle',
      point: 48,
      description: 'Prefer opaque token usage prior to JWT',
      ruleId: 'DE04',
      id: 4
    }
  ]
}

const step3 = {
  title: '👨‍💻 Usage',
  id: 3,
  section: 'usage',
  rules: [
    {
      ruleId: 'US01',
      point: 75,
      title: 'Use query parameters for GET Methods',
      description:
        'Implement filters to limit which data are returned by the API (send just the data the consumer need).',
      type: 'toggle',
      id: 1
    },
    {
      id: 2,
      point: 150,
      type: 'toggle',
      description: 'Decomission end of life or not used APIs',
      ruleId: 'US02',
      title: 'Decomission end of life or not used APIs'
    },
    {
      description: 'Compute resources saved & Network impact reduced',
      id: 3,
      ruleId: 'US03',
      title: 'Number of API version <=2',
      point: 150,
      type: 'toggle'
    },
    {
      ruleId: 'US04',
      description:
        'Optimize queries to limit the information returned to what is strictly necessary.',
      id: 4,
      type: 'toggle',
      title: 'Usage of Pagination of results available',
      point: 150
    },
    {
      ruleId: 'US05',
      id: 5,
      title:
        'Choosing relevant data representation (user don’t need to do multiple calls) is Cx API ?',
      description:
        'Choose the correct API based on use case to avoid requests on multiple systems or large number of requests. Refer to the data catalog to validate the data source.',
      type: 'toggle',
      point: 300
    },
    {
      point: 375,
      title: 'Number of Consumers',
      id: 6,
      description:
        'Deploy an API well designed and documented to increase the reuse rate. Rate based on number of different consumers',
      type: 'number',
      ruleId: 'US06',
      formula: '(x * 50) - 50'
    },
    {
      id: 7,
      title: 'Error rate',
      ruleId: 'US07',
      point: 300,
      description: 'Monitor and decrease the error rate to avoid over processing',
      type: 'number',
      formula: '(1 - (x / 100)) * 100'
    }
  ]
}

const step4 = {
  id: 4,
  rules: [
    {
      description: 'Align log retention period to the business need (ops and Legal)',
      id: 1,
      ruleId: 'LO01',
      point: 600,
      type: 'toggle',
      title: 'Align log retention period to the business need (ops and Legal)'
    }
  ],
  title: '📋 Logs',
  section: 'logs'
}

export const DATA_FLOW_STEPS: Step[] = [step1, step2, step3, step4]

export type Step = {
  section: string
  title: string
  rules: Rules[]
  id: number
}
export type Rules = {
  title: string
  ruleId: string
  id: number
  description: string
  detail?: string
  type: string
  point: number
}
