API for the zoo/deer-park listing site.

Requirements:
- "bcrypt"
  - For hashing passwords, for admin accounting
- "body-parser"
  - Parses json objects posted as the body of requests
- "cors"
  - Enables CORS
- "debug"
  - Node debug outputting
- "express"
  - This is the web framework that makes it all possible
- "morgan"
  - Logging
- "postcode"
  - Used in zoo distances to validate UK postcodes
- "promise-mysql"
  - Interface with mysql database, with promises
- "request"
  - Required for request-promise
- "request-promise"
  - Promise wrapper over HTTP requests, used when sending out external API queries
- "uuid"
  - Generating random tokens