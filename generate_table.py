import re

with open('src/config/questionnaireConfig.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all patients
patients = re.findall(r"patient_id:\s*'([^']+)',.*?variants:\s*\[\s*{\s*variant_id:\s*'A'.*?questions:\s*\[(.*?)\]\s*},", content, re.DOTALL)

print("| New Turing Patient | Original Patient | Structures Extracted |")
print("| :--- | :--- | :--- |")

new_idx = 1
for pid, questions_block in patients:
    if pid == 'patient_16':
        continue
    
    structures = []
    # Find all labels like <p>CTVp_R_A</p>
    labels = re.findall(r"label:\s*'<p>(.*?)</p>'", questions_block)
    for lbl in labels:
        if "Wat is de belangrijkste reden" in lbl:
            continue
        # Remove _A
        if lbl.endswith('_A'):
            struct = lbl[:-2]
            if struct not in structures:
                structures.append(struct)
    
    new_pid = f"patient_{new_idx:02d}_T"
    print(f"| **{new_pid}** | {pid} | {', '.join(structures)} |")
    new_idx += 1
