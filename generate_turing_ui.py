import os

base_dir = r"c:\Users\z060229\Documents\study-insights-main\src\components\questionnaire"
steps_dir = os.path.join(base_dir, "steps")
turing_steps_dir = os.path.join(base_dir, "turing-steps")

os.makedirs(turing_steps_dir, exist_ok=True)

for step_file in ["ProfileStep.tsx", "SegmentationStep.tsx", "FeedbackStep.tsx"]:
    with open(os.path.join(steps_dir, step_file), "r", encoding="utf-8") as f:
        content = f.read()
    
    # Replace dataLayer with dataLayerTuring
    content = content.replace("from '@/lib/dataLayer'", "from '@/lib/dataLayerTuring'")
    # Replace questionnaireConfig with turingConfig
    content = content.replace("from '@/config/questionnaireConfig'", "from '@/config/turingConfig'")
    content = content.replace("questionnaireConfig", "turingQuestionnaireConfig")

    with open(os.path.join(turing_steps_dir, step_file), "w", encoding="utf-8") as f:
        f.write(content)

# Now duplicate Questionnaire.tsx to TuringQuestionnaire.tsx
with open(r"c:\Users\z060229\Documents\study-insights-main\src\pages\Questionnaire.tsx", "r", encoding="utf-8") as f:
    q_content = f.read()

q_content = q_content.replace("Questionnaire", "TuringQuestionnaire")
q_content = q_content.replace("from '@/lib/dataLayer'", "from '@/lib/dataLayerTuring'")
q_content = q_content.replace("from '@/config/questionnaireConfig'", "from '@/config/turingConfig'")
q_content = q_content.replace("questionnaireConfig", "turingQuestionnaireConfig")
q_content = q_content.replace("steps/ProfileStep", "turing-steps/ProfileStep")
q_content = q_content.replace("steps/SegmentationStep", "turing-steps/SegmentationStep")
q_content = q_content.replace("steps/FeedbackStep", "turing-steps/FeedbackStep")

with open(r"c:\Users\z060229\Documents\study-insights-main\src\pages\TuringQuestionnaire.tsx", "w", encoding="utf-8") as f:
    f.write(q_content)

print("Generated UI files successfully.")
