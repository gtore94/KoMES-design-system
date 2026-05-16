#!/usr/bin/env python3
"""Rebuilds index.standalone.html by inlining all JSX files from index.html."""

import re
import sys
import os

SRC = "index.html"
OUT = "index.standalone.html"

JSX_FILES = [
    "Components.jsx",
    "LeftRail.jsx",
    "NewPatientModal.jsx",
    "ChartActingPanel.jsx",
    "PatientListScreen.jsx",
    "PatientManagementScreen.jsx",
    "PatientChartScreen.jsx",
    "PrescriptionScreen.jsx",
    "ScheduleScreen.jsx",
    "PaymentScreen.jsx",
    "herbData.jsx",
    "HerbInventoryParts.jsx",
    "HerbRegistrationModal.jsx",
    "HerbAdjustmentScreen.jsx",
    "HerbInventoryScreen.jsx",
    "suppliesData.jsx",
    "SuppliesParts.jsx",
    "SupplyRegistrationModal.jsx",
    "SupplyAdjustmentScreen.jsx",
    "SuppliesScreen.jsx",
    "purchaseOrdersData.jsx",
    "PurchaseOrderHistoryScreen.jsx",
    "PurchaseOrderDraftScreen.jsx",
    "RecommendationSettingsModal.jsx",
    "claimData.jsx",
    "ClaimSidebar.jsx",
    "ClaimList.jsx",
    "ClaimSubmissionFlow.jsx",
    "InsuranceClaimScreen.jsx",
    "PatientPickerData.jsx",
    "PatientPickerModal.jsx",
    "MedicalFormScreen.jsx",
    "PatientInstructionData.jsx",
    "PatientInstructionModal.jsx",
    "staffData.jsx",
    "NewStaffModal.jsx",
    "StaffManagementScreen.jsx",
    "SettingsScreen.jsx",
]

def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    with open(SRC) as f:
        html = f.read()

    # Head: everything before first external babel script
    head_end = html.index('<script type="text/babel" src=')
    head = html[:head_end].replace("KoMES — UI Kit", "KoMES — UI Kit (Standalone)")

    # App script: last inline <script type="text/babel"> block
    last = html.rindex('<script type="text/babel">')
    app_script = html[last : html.index("</script>", last) + len("</script>")]

    # Detect any new JSX files referenced in index.html but not in JSX_FILES
    referenced = re.findall(r'src="([^"]+\.jsx)', html)
    referenced_clean = [r.split("?")[0] for r in referenced]
    missing = [f for f in referenced_clean if f not in JSX_FILES]
    if missing:
        print(f"WARNING: these files are in {SRC} but not in JSX_FILES list:")
        for m in missing:
            print(f"  - {m}")

    parts = [head, "\n"]
    ok = err = 0
    for fname in JSX_FILES:
        if os.path.exists(fname):
            with open(fname) as f:
                content = f.read()
            parts.append(f'<script type="text/babel">\n{content}\n</script>\n\n')
            print(f"  ✓  {fname}")
            ok += 1
        else:
            print(f"  ✗  MISSING: {fname}", file=sys.stderr)
            err += 1

    parts.append(app_script)
    parts.append("\n</body>\n</html>\n")

    with open(OUT, "w") as f:
        f.write("".join(parts))

    size_kb = os.path.getsize(OUT) // 1024
    print(f"\n{'OK' if not err else 'DONE WITH ERRORS'} — {ok} files inlined, {OUT} ({size_kb} KB)")
    if err:
        sys.exit(1)

if __name__ == "__main__":
    main()
