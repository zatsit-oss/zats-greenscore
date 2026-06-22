# Glossary

Business and technical terms used in the project.

## API Green Score Terms

### Green Score
Overall eco-design score of an API, expressed on a scale from 0 to 100. The higher the score, the better the eco-design.

### Ranking
Ranking letter based on the score:
- **A**: Excellent (high score)
- **B**: Good
- **C**: Average
- **D**: Needs improvement
- **E**: Poor (low score)

### Section
Category grouping several questions of the questionnaire:
- **Architecture**: Architectural choices (event-driven, location, scalability)
- **Design**: API design (format, cache, tokens, filters)
- **Usage**: Usage and operation (versioning, pagination, monitoring)
- **Logs**: Log management (retention, volume)

### Points
Weighting of a question in the score calculation. Each question has an associated number of points reflecting its importance in eco-design.

## Technical Terms

### Audit
Evaluation session of a project via the questionnaire. An audit produces a score and a ranking.

### Project
Entity representing an API or a system to evaluate. Contains the metadata and the answers to the questionnaire.

### Answer
Answer to a question of the questionnaire. Can be:
- **Boolean**: Yes/No (is the practice applied?)
- **Numeric**: Numeric value (e.g.: error rate, number of consumers)

### Formula
Some questions use a formula to calculate the points based on the numeric value entered. E.g.: `(x * 50) - 50` for the number of consumers.

## Evaluated Best Practices

### Event Driven Architecture (AR01)
Event-based architecture to avoid excessive polling.

### Cache
Caching mechanism to reduce unnecessary requests and preserve resources.

### Opaque Token
Opaque authentication token (vs JWT), lighter and more secure.

### Pagination
Mechanism allowing to limit the volume of data returned per request.

### Filtering
Ability to filter the returned data to retrieve only what is needed.
