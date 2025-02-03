#!/bin/sh
# Create env.js file and write env variables
rm -rf ./src/assets/env.js
touch ./src/assets/env.js

# Add assignment 
echo "(function(window) {" >> ./src/assets/env.js
echo "    window.env = window.env || {};" >> ./src/assets/env.js
echo "    window.env.API_URL = '${API_URL:-http://localhost:3000/api}';" >> ./src/assets/env.js
echo "})(this);" >> ./src/assets/env.js
