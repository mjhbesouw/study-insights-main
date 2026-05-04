import os

src_path = r"c:\Users\z060229\Documents\study-insights-main\src\lib\dataLayer.ts"
dest_path = r"c:\Users\z060229\Documents\study-insights-main\src\lib\dataLayerTuring.ts"

with open(src_path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("dls_study_", "turing_")
content = content.replace('supabase.from("answers")', 'supabase.from("answers_turing")')
content = content.replace("supabase.from('answers')", "supabase.from('answers_turing')")
content = content.replace('supabase.from("sessions")', 'supabase.from("sessions_turing")')
content = content.replace("supabase.from('sessions')", "supabase.from('sessions_turing')")
content = content.replace('supabase.from("submissions")', 'supabase.from("submissions_turing")')
content = content.replace("supabase.from('submissions')", "supabase.from('submissions_turing')")
content = content.replace('import { questionnaireConfig } from "@/config/questionnaireConfig";', 'import { turingQuestionnaireConfig } from "@/config/turingConfig";')
content = content.replace('questionnaireConfig.', 'turingQuestionnaireConfig.')

with open(dest_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Generated dataLayerTuring.ts successfully.")
