#!/bin/bash

# Recreate config file
rm -rf ./src/assets/env.js
touch ./src/assets/env.js

# Add assignment 
echo "(function(window) {" >> ./src/assets/env.js
echo "    window.env = window.env || {};" >> ./src/assets/env.js
echo "    window.env.API_URL = '${API_URL}';" >> ./src/assets/env.js
echo "})(this);" >> ./src/assets/env.js
