const fs = require('fs')
const path = require('path')

const dirPath = './data'
const result = {}

const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.md'))

files.forEach((file) => {
  const content = fs.readFileSync(path.join(dirPath, file), 'utf-8')

  const identifiersMatch = content.match(/### Identifiers\s+([\s\S]*?)(?=\n###|\n*$)/)
  const identifiersTable = identifiersMatch ? identifiersMatch[1].trim() : null

  let identifierKey = null
  if (identifiersTable) {
    const lines = identifiersTable.split('\n')
    if (lines.length >= 3) {
      const thirdLine = lines[2]
      const cells = thirdLine
        .split('|')
        .map((c) => c.trim())
        .filter(Boolean)
      identifierKey = cells[0]
    }
  }

  const descMatch = content.match(/### Description\s+([\s\S]*?)(?=\n###|\n*$)/)
  const description = descMatch ? descMatch[1].trim() : null

  if (identifierKey && description) {
    result[identifierKey] = description
  }
})

fs.writeFileSync('../../src/config/fields-description.json', JSON.stringify(result, null, 2))
