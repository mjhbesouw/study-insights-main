with open(r"c:\Users\z060229\Documents\study-insights-main\src\lib\dataLayerTuring.ts", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("session_id:", "session_id_turing:")
content = content.replace("ans.session_id", "ans.session_id_turing")
content = content.replace(".eq(\"id\", sessionId)", ".eq(\"session_id_turing\", sessionId)")
content = content.replace(".eq('session_id', sessionId)", ".eq('session_id_turing', sessionId)")

with open(r"c:\Users\z060229\Documents\study-insights-main\src\lib\dataLayerTuring.ts", "w", encoding="utf-8") as f:
    f.write(content)

print("Updated session_id_turing in dataLayerTuring.ts")
