
import re

with open(r'C:\Users\DELL\Desktop\FitStart\client\src\pages\Login.js', encoding='utf-8') as f:
    code = f.read()

original_len = len(code)

# 1. Add framer-motion import
old_react_import = "import React, { useState, useEffect } from 'react';"
new_react_import = "import React, { useState, useEffect } from 'react';\nimport { motion } from 'framer-motion';\nimport { FadeInWhenVisible, StaggerContainer, StaggerItem } from '../components/FadeInWhenVisible';"
code = code.replace(old_react_import, new_react_import, 1)

# 2. Wrap form card in FadeInWhenVisible
old_form_container = "        <div style={{ width: '100%', maxWidth: '440px' }}>"
new_form_container = "        <FadeInWhenVisible delay={0.05}><div style={{ width: '100%', maxWidth: '440px' }}>"
code = code.replace(old_form_container, new_form_container, 1)

# Close FadeInWhenVisible before right panel comment
old_left_close = "      </div>\n\n      {/* RIGHT:"
new_left_close = "      </FadeInWhenVisible>\n      </div>\n\n      {/* RIGHT:"
code = code.replace(old_left_close, new_left_close, 1)

# 3. Find submit button (id="login-submit") and convert to motion.button
old_submit_start = '                  <button\n                    id="login-submit"'
new_submit_start = '                  <motion.button\n                    id="login-submit"\n                    whileHover={{ scale: 1.03, boxShadow: "0 8px 32px rgba(182,255,60,0.45)", transition: { type: "spring", stiffness: 260, damping: 20 } }}\n                    whileTap={{ scale: 0.97, transition: { type: "spring", stiffness: 400, damping: 40 } }}'
code = code.replace(old_submit_start, new_submit_start, 1)

# Close motion.button - find the end of the submit button
# It's followed by "                  <div" for the signup link  
if '</button>' in code:
    # Replace last occurrence before the signup link div
    # Find all occurrences
    idx = code.find('id="login-submit"')
    if idx >= 0:
        # Find the </button> after this position
        close_idx = code.find('</button>', idx)
        if close_idx >= 0:
            code = code[:close_idx] + '</motion.button>' + code[close_idx + len('</button>'):]
            print("Replaced submit button close tag")

# 4. Apply StaggerContainer/Item to feature list on right panel
old_features_map = "{FEATURES.map(({ Icon, text, color }) => ("
new_features_map = "<StaggerContainer>{FEATURES.map(({ Icon, text, color }) => (<StaggerItem key={text}>"
code = code.replace(old_features_map, new_features_map, 1)

old_features_end = "            ))}\n"
new_features_end = "            </StaggerItem>))}</StaggerContainer>\n"
code = code.replace(old_features_end, new_features_end, 1)

changed = len(code) - original_len
print(f"File: {original_len} -> {len(code)} chars (delta: {changed})")
print(f"motion.button applied: {'motion.button' in code}")
print(f"FadeInWhenVisible: {'FadeInWhenVisible' in code}")
print(f"StaggerContainer: {'StaggerContainer' in code}")

with open(r'C:\Users\DELL\Desktop\FitStart\client\src\pages\Login.js', 'w', encoding='utf-8') as f:
    f.write(code)
print("Login.js patched")
