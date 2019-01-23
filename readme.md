API for the zoo/deer-park listing site.

Requirements:
- "bcrypt": "^1.0.3",
  - For hashing passwords, for admin accounting
- "body-parser": "~1.17.1",
  - Parses json objects posted as the body of requests
- "cors": "~2.8.3",
  - Enables CORS
- "debug": "~2.6.3",
  - Node debug outputting
- "express": "~4.15.2",
  - This is the web framework that makes it all possible
- "morgan": "~1.8.1",
  - Logging
- "postcode": "^0.2.5",
  - Used in zoo distances to validate UK postcodes
- "promise-mysql": "latest",
  - Interface with mysql database, with promises
- "request-promise": "^4.2.0",
  - Promise wrapper over HTTP requests, used when sending out external API queries
- "uuid": "latest"